import { StateCreator } from 'zustand';

import { CohereChatRequest, DEFAULT_CHAT_TEMPERATURE, ManagedTool, Category } from '@/cohere-client';
import { isDefaultFileLoaderTool } from '@/utils';

import { StoreState } from '..';

const Project2025Tool: ManagedTool = {
  name: 'project_2025',
  display_name: 'Project 2025',
  description: 'Retrieves our analysis of Project 2025.',
  parameter_definitions: {
    "query": {
        "description": "Query for retrieval.",
        "type": "str",
        "required": true,
    }
  },
  is_visible: true,
  is_available: true,
  is_auth_required: false,
  error_message: "Project 2025 is not available.",
  auth_url: null,
  category: Category.DATA_LOADER
}

const INITIAL_STATE = {
  model: undefined,
  temperature: DEFAULT_CHAT_TEMPERATURE,
  preamble: '',
  tools: [Project2025Tool],
  fileIds: [],
  deployment: undefined,
  deploymentConfig: undefined,
};

export type ConfigurableParams = Pick<CohereChatRequest, 'temperature' | 'tools'> & {
  preamble: string;
  fileIds: CohereChatRequest['file_ids'];
  model?: string;
  deployment?: string;
  deploymentConfig?: string;
};

type State = ConfigurableParams;
type Actions = {
  setParams: (params?: Partial<ConfigurableParams> | null) => void;
  resetFileParams: VoidFunction;
};

export type ParamStore = {
  params: State;
} & Actions;

export const createParamsSlice: StateCreator<StoreState, [], [], ParamStore> = (set) => ({
  setParams(params?) {
    let tools = params?.tools;
    let fileIds = params?.fileIds;

    set((state) => {
      return {
        params: {
          ...state.params,
          ...params,
          ...(tools ? { tools } : [Project2025Tool]),
          ...(fileIds ? { fileIds } : {}),
        },
      };
    });
  },
  resetFileParams() {
    set((state) => {
      return {
        params: {
          ...state.params,
          fileIds: [],
          tools: state.params?.tools?.filter((t) => !isDefaultFileLoaderTool(t)),
        },
      };
    });
  },
  params: INITIAL_STATE,
});
