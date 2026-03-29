import json
import os
import boto3
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from state import AgentState

load_dotenv()

llm = ChatOpenAI(
    model='Meta-Llama-3.1-8B-Instruct',
    openai_api_key=os.getenv("SAMBANOVA_API_KEY"),
    base_url="https://api.sambanova.ai/v1",
    temperature=0.1
)


def get_aws_session(state: AgentState):
    aws_access_key = state.get("aws_access_key_id") or os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret_key = state.get("aws_secret_access_key") or os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_session_token = state.get("aws_session_token") or os.getenv("AWS_SESSION_TOKEN")
    region = state.get("aws_region") or os.getenv("AWS_DEFAULT_REGION", "us-east-1")

    session = boto3.Session(
        aws_access_key_id=aws_access_key,
        aws_secret_access_key=aws_secret_key,
        aws_session_token=aws_session_token,
        region_name=region
    )
    return session


def fetch_cloudwatch_data(session: boto3.Session, target_resource: str) -> dict:
    cloudwatch = session.client("cloudwatch")
    logs = session.client("logs")

    resource_metrics = {}

    try:
        metrics_response = cloudwatch.list_metrics(
            Dimensions=[{"Name": "ResourceId", "Value": target_resource}]
        )
        resource_metrics["available_metrics"] = [
            m["MetricName"] for m in metrics_response.get("Metrics", [])
        ]
    except Exception as e:
        resource_metrics["metrics_error"] = str(e)

    try:
        log_groups_response = logs.describe_log_groups(logGroupNamePrefix=f"/aws/{target_resource.lower()}")
        log_groups = [g["logGroupName"] for g in log_groups_response.get("logGroups", [])]
        resource_metrics["log_groups"] = log_groups

        if log_groups:
            log_events_response = logs.filter_log_events(
                logGroupName=log_groups[0],
                limit=20,
                filterPattern="ERROR"
            )
            resource_metrics["recent_errors"] = [
                e["message"] for e in log_events_response.get("events", [])
            ]
    except Exception as e:
        resource_metrics["logs_error"] = str(e)

    try:
        config = session.client("config")
        compliance_response = config.describe_compliance_by_resource(
            ResourceType="AWS::S3::Bucket" if "s3" in target_resource.lower() else "AWS::EC2::Instance",
            ResourceId=target_resource
        )
        resource_metrics["compliance"] = compliance_response.get("ComplianceByResources", [])
    except Exception as e:
        resource_metrics["config_error"] = str(e)

    return resource_metrics


def analyst_node(state: AgentState):
    session = get_aws_session(state)
    api_data = fetch_cloudwatch_data(session, state["target_resource"])

    sys_msg = SystemMessage(content="Describe the specific technical failure in exactly one sentence. No prefixes.")
    user_msg = HumanMessage(content=f"DATA: {state['target_resource']} | {json.dumps(api_data)}")
    res = llm.invoke([sys_msg, user_msg])
    return {"messages": [res], "api_response": api_data}


def architect_node(state: AgentState):
    sys_msg = SystemMessage(
        content="Explain the security risk of this misconfiguration in exactly one sentence. No prefixes.")
    user_msg = HumanMessage(content=f"ISSUE: {state['messages'][-1].content}")
    res = llm.invoke([sys_msg, user_msg])
    return {"messages": [res]}


def invoke_lambda_remediation(session: boto3.Session, target_resource: str, action: str) -> dict:
    lambda_client = session.client("lambda")
    lambda_function_name = os.getenv("REMEDIATION_LAMBDA_NAME", "aws-remediation-handler")

    payload = {
        "resource": target_resource,
        "action": action
    }

    try:
        response = lambda_client.invoke(
            FunctionName=lambda_function_name,
            InvocationType="RequestResponse",
            Payload=json.dumps(payload)
        )
        response_payload = json.loads(response["Payload"].read())
        status_code = response.get("StatusCode", 500)

        if status_code == 200 and not response_payload.get("errorMessage"):
            return {"status": "success", "result": response_payload}
        else:
            return {"status": "failed", "error": response_payload.get("errorMessage", "Unknown Lambda error")}

    except Exception as e:
        return {"status": "failed", "error": str(e)}


def remedian_node(state: AgentState):
    session = get_aws_session(state)
    resource = state["target_resource"].upper()

    if "S3" in resource:
        action = "s3.put_public_access_block"
    elif "RDS" in resource:
        action = "rds.modify_db_instance"
    else:
        action = "ec2.modify_instance_attribute"

    remediation_result = invoke_lambda_remediation(session, state["target_resource"], action)
    status_msg = remediation_result.get("status", "failed")

    if status_msg == "success":
        msg = f"SUCCESS: AWS successfully executed {action}. The resource {state['target_resource']} has been moved to the fixed list."
    else:
        msg = f"FAILED: AWS failed to execute {action}. Error: {remediation_result.get('error', 'Unknown')}."

    return {"messages": [HumanMessage(content=msg)]}