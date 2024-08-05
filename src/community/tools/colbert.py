import os
from functools import lru_cache
from itertools import groupby
from math import log
from pathlib import Path
from typing import Any, Dict, List, Optional, cast

import numpy as np
from community.tools import BaseTool
from pydantic import BaseModel
from ragatouille import RAGPretrainedModel


class RagatouilleDocumentMetadata(BaseModel):
    corpus_order: int
    corpus_section: str
    corpus_section_order: int
    corpus_subsection: str
    element_ids: list[str]
    corpus_text: str
    analysis: str
    concerns: list[str]
    starting_page_number: int
    page_numbers: list[int]
    printed_page_numbers: list[str]
    source_url: str
    authors: list[str]
    contributors: list[str]
    acronyms: dict[str, str]
    named_entities: list[str]

    __hash__ = object.__hash__ # type: ignore

class RagatouilleDocument(BaseModel):
    content: str
    score: float
    merged_scores: list[float] = []
    rank: int
    document_id: str
    passage_id: int
    document_metadata: RagatouilleDocumentMetadata

    __hash__ = object.__hash__ # type: ignore

    @lru_cache(1)
    def headline_pieces(self) -> tuple[str, Optional[str]]:
        text = self.document_metadata.corpus_subsection.rstrip('.')
        splits = text.split(' - ')
        if len(splits) > 1:
            head = " - ".join(splits[0:-1])
            subhead = " ".join(splits[-1:])
            return (head, subhead)
        else:
            return (text, None)

    def headline(self) -> str:
        return self.headline_pieces()[0]

    def subhead(self) -> Optional[str]:
        return self.headline_pieces()[1]
    
    @lru_cache(1)
    def url(self) -> str:
        base_url = self.document_metadata.source_url
        page_no = self.document_metadata.starting_page_number
        elements = [base_url, page_no]
        filtered = [str(e) for e in elements if e is not None]
        return "#page=".join(filtered)

    
    @staticmethod
    def merge_results(results: list['RagatouilleDocument']) -> list['RagatouilleDocument']:
        results = sorted(results, key=lambda x: x.document_metadata.corpus_order)
        merged: list[RagatouilleDocument] = []
        for _, group in groupby(results, key=lambda x: x.document_metadata.corpus_order):
            ds = list(group)
            merged.append(RagatouilleDocument.merge(ds))
        return merged


    @staticmethod
    def merge(docs: list['RagatouilleDocument']) -> 'RagatouilleDocument':
        scores = [doc.score for doc in docs]
        max_score = max(scores)
        content = " ".join([doc.content for doc in docs])
        return docs[0].model_copy(update={ "content": content, "score": max_score, "merged_scores": scores })
    
    @staticmethod
    def rerank_after_merges(docs: list['RagatouilleDocument']) -> list['RagatouilleDocument']:
        """Calculate merged scores with match amplification"""
        alpha = 0.5  # Adjust this factor to control the level of amplification for additional matches
        for doc in docs:
            if len(doc.merged_scores) > 0:
                score_list = doc.merged_scores
            else:
                score_list = [doc.score]
            count_of_matches = len(doc.merged_scores)
            match_amplification_factor = 1 + alpha * (count_of_matches - 1)
            exp_scores = np.exp(score_list)  # Calculate exponential without scaling
            sum_exp_scores = np.sum(exp_scores)  # Sum these exponential scores
            merged_score = log(1 + sum_exp_scores * match_amplification_factor)  # Apply amplified logarithmic damping
            doc.score = merged_score
        
        # Sort them by their new scores
        reordered = sorted(docs, key=lambda x: x.score)
        # Reassign rank based on new sort order
        for i, doc in enumerate(reordered):
            doc.rank = i + 1
        return reordered

index_path = os.environ.get("COLBERT_INDEX_PATH")
if not index_path:
    raise RuntimeError("You must provide a COLBERT_INDEX_PATH value in your environment")

index_path = Path(index_path)
RAG = RAGPretrainedModel.from_index(index_path)

class ColbertRetriever(BaseTool):
    @classmethod
    def is_available(cls) -> bool:
        return True

    def call(self, parameters: dict, **kwargs: Any) -> List[Dict[str, Any]]:
        query = parameters.get("query", "")
        documents = cast(list[dict], RAG.search(query))
        ragatouille_documents = [RagatouilleDocument(**doc) for doc in documents]
        ragatouille_documents = RagatouilleDocument.merge_results(ragatouille_documents)
        ragatouille_documents = RagatouilleDocument.rerank_after_merges(ragatouille_documents)
        result = [
            {
                "text": doc.content,
                "title": doc.subhead() or doc.headline(),
                "url": doc.url(),
                "pdfUrl": doc.url(),
                "excerptHeadline": doc.headline(),
                "excerptSubhead": doc.subhead(),
                "excerpt": doc.document_metadata.corpus_text,
                "concerns": doc.document_metadata.concerns
            }
            for doc in ragatouille_documents
        ]
        return result
