from langchain.agents import initialize_agent, Tool, AgentType
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os
from prompts import GEN_PROMPT, add_memories_to_prompt, add_sequence_to_generator

load_dotenv()
llm = ChatOpenAI(model="gpt-4-0613")


sequence = []


def add_step_to_sequence(step):
    formatted_step = step.replace("\\n", "\n")
    sequence.append({"content": formatted_step})
    return f"""Sequence item number {len(sequence) - 1} created with "Add Step to sequence". It's content is: "{step}"."""


def reset_sequence():
    global sequence
    sequence = []
    return "Sequence has been reset. It now has 0 items."


def finalize_sequence():
    return """The sequence is finalized. Make your final output "Sequence Creation Complete"."""


tools = [
    Tool(
        name="Add Step to sequence",
        description="""Add a step as a string of text to the sequence""",
        func=lambda steps: add_step_to_sequence(steps),
    ),
    Tool(
        name="Finalize sequence",
        description="Call this when you are done with the sequence to finalize it and get the JSON formatted output. Enter `finalize` into this function.",
        func=lambda _: finalize_sequence(),
    ),
    Tool(
        name="Reset sequence",
        description="Reset the sequence to start over. Always call this function before creating a sequence. Also call this function if the sequence does not generally fit guidelines or you want to start over. Enter `reset` into this function.",
        func=lambda _: reset_sequence(),
    ),
]


agent = initialize_agent(
    agent_type=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION,
    tools=tools,
    api_key=os.environ.get("OPENAI_API_KEY"),
    llm=llm,
    handle_parsing_errors=True,
)


def call_gen_agent(messages_array, old_sequence):
    global sequence
    sequence = []
    prompt = GEN_PROMPT
    if len(old_sequence) > 0:
        prompt = add_sequence_to_generator(old_sequence)
    messages_array = [{"role": "system", "content": prompt}] + messages_array

    result = agent.invoke(messages_array)
    output = result["output"]

    return sequence
