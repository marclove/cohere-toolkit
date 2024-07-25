import time

from backend.services.logger import get_logger
from backend.services.sync import app
from backend.services.sync.constants import DEFAULT_TIME_OUT, Status
from backend.services.sync.env import env

from .utils import get_file_details

logger = get_logger()

ACTION_NAME = "edit"


@app.task(time_limit=DEFAULT_TIME_OUT)
def edit(file_id: str, index_name: str, user_id: str, **kwargs):
    # Get file bytes, web view link, title
    file_details = get_file_details(file_id=file_id, user_id=user_id)
    if file_details is None:
        return {
            "action": ACTION_NAME,
            "status": Status.CANCELLED.value,
            "file_id": file_id,
        }

    file_bytes = file_details["file_bytes"]
    web_view_link = file_details["web_view_link"]
    title = file_details["title"]

    if not file_bytes:
        return {
            "action": ACTION_NAME,
            "status": Status.FAIL.value,
            "message": "File bytes could not be parsed.",
            "file_id": file_id,
        }

    # take compass action
    try:
        # idempotent create index
        logger.info(
            "Initiating Compass create_index action for index {}".format(index_name)
        )
        env().COMPASS.invoke(
            env().COMPASS.ValidActions.CREATE_INDEX,
            {
                "index": index_name,
            },
        )
        logger.info("Finished Compass create_index action for index".format(index_name))
        logger.info(
            "Initiating Compass update action for file {}".format(web_view_link)
        )
        # Update doc
        env().COMPASS.invoke(
            env().COMPASS.ValidActions.UPDATE,
            {
                "index": index_name,
                "file_id": file_id,
                "file_bytes": file_bytes,
            },
        )
        logger.info("Finished Compass update action for file {}".format(web_view_link))
        logger.info("Initiating Compass add context for file {}".format(web_view_link))
        # Add title and url context
        env().COMPASS.invoke(
            env().COMPASS.ValidActions.ADD_CONTEXT,
            {
                "index": index_name,
                "file_id": file_id,
                "context": {
                    "url": web_view_link,
                    "title": title,
                    "last_updated": int(time.time()),
                },
            },
        )
        logger.info(
            "Finished Compass add context action for file {}".format(web_view_link)
        )
    except Exception as e:
        logger.error(
            "Failed to edit document in Compass for file {}: {}".format(
                web_view_link, str(e)
            )
        )
        return {"action": ACTION_NAME, "status": Status.FAIL.value, "file_id": file_id}

    return {"action": ACTION_NAME, "status": Status.SUCCESS.value, "file_id": file_id}
