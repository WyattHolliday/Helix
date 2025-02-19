from langchain.agents import initialize_agent, Tool, AgentType
from langchain_openai import ChatOpenAI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from prompts import EVAL_PROMPT, add_memories_to_prompt, add_sequence_to_evaluator

# from db import add_user_memory, add_sequence_memory


load_dotenv()
llm = ChatOpenAI(model="gpt-4-0613")


def create_sequence():
    return "Sequence created, simply say `completed` and only that to finish creating the sequence. You must say exactly `completed` with no punctuation or else the sequence otherwise it will not work."


class CreatePlanInput(BaseModel):
    plan_steps: list[str]


class AskUserInput(BaseModel):
    question: str


tools = [
    Tool(
        name="Create Sequence",
        description="Create a list of items to complete the sequence only if there is sufficient information. This function must be called in order to create the sequence. Simply enter `create` into this function.",
        func=lambda _: create_sequence(),
    ),
    # Tool(
    #     name="Add information to user memory",
    #     description="Add information that is generally relevant to the user across any sequence they might want to create to a RAG memory store as a string.",
    #     func=lambda memory: db.add_user_memory(1, memory),
    # ),
    # Tool(
    #     name="Add information to sequence memory",
    #     description="Add information that is specific to the sequence the user wants to create to a RAG memory store as a string.",
    #     func=lambda memory: db.add_sequence_memory(1, memory),
    # ),
]

agent = initialize_agent(
    agent_type=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    tools=tools,
    api_key=os.environ.get("OPENAI_API_KEY"),
    llm=llm,
    handle_parsing_errors=True,
)


def chat_eval_agent(messages_array, sequence):
    prompt = EVAL_PROMPT
    if len(sequence) > 0:
        prompt += add_sequence_to_evaluator(sequence)
    messages_array = [{"role": "system", "content": prompt}] + messages_array

    response = agent.invoke(messages_array)
    output = response["output"]

    if output.strip().lower() == "completed":
        return output, True
    print("Asking user", output)
    return output, False
