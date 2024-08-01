import argparse

from backend.config.deployments import (
    AVAILABLE_MODEL_DEPLOYMENTS as MANAGED_DEPLOYMENTS_SETUP,
)
from community.config.deployments import (
    AVAILABLE_MODEL_DEPLOYMENTS as COMMUNITY_DEPLOYMENTS_SETUP,
)
from community.config.tools import COMMUNITY_TOOLS_SETUP
from backend.cli.utils import (
    welcome_message,
    wrap_up,
    show_examples,
)
from backend.cli.prompts import (
    deployment_prompt,
    community_tools_prompt,
    tool_prompt,
    review_variables_prompt,
    update_variable_prompt,
    select_deployments_prompt,
    PROMPTS,
)
from backend.cli.setters import (
    write_env_file,
    write_template_config_files,
    write_template_files,
)
from backend.cli.constants import (
    TOOLS,
)



def start():
    parser = argparse.ArgumentParser()
    parser.add_argument("--use-community", action=argparse.BooleanOptionalAction)
    args = parser.parse_args()

    welcome_message()

    secrets = {}

    # SET UP ENVIRONMENT
    for _, prompt in PROMPTS.items():
        prompt(secrets)

    # ENABLE COMMUNITY TOOLS
    use_community_features = args.use_community and community_tools_prompt(secrets)
    if use_community_features:
        TOOLS.update(COMMUNITY_TOOLS_SETUP)

    # SET UP TOOLS
    for name, configs in TOOLS.items():
        tool_prompt(secrets, name, configs)

    # SET UP ENVIRONMENT FOR DEPLOYMENTS
    all_deployments = MANAGED_DEPLOYMENTS_SETUP.copy()
    if use_community_features:
        all_deployments.update(COMMUNITY_DEPLOYMENTS_SETUP)

    selected_deployments = select_deployments_prompt(all_deployments, secrets)

    for deployment in selected_deployments:
        deployment_prompt(secrets, all_deployments[deployment])

    # SET UP .ENV FILE
    write_env_file(secrets)

    # SET UP YAML CONFIG FILES
    write_template_config_files()

    # REVIEW VARIABLES
    variables_to_update = review_variables_prompt(secrets)
    update_variable_prompt(secrets, variables_to_update)

    # WRAP UP
    wrap_up(selected_deployments)

    # SHOW SOME EXAMPLES
    show_examples()

if __name__ == "__main__":
    start()
