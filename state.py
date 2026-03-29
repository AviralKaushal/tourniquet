from typing import TypedDict, Any

class AgentState(TypedDict):
    messages: list
    target_resource: str
    api_response: dict
    aws_access_key_id: str
    aws_secret_access_key: str
    aws_session_token: str
    aws_region: str