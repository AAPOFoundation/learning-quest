"""Expedition stage 4: a tiny agent eval. The agent has one tool and must use it to answer.
It runs in-process (no Docker, no shell), with fake data, so it is safe and Windows-friendly.
Dry run (free):   inspect eval agent_eval.py --model mockllm/model
Real model:       inspect eval agent_eval.py --model <provider/model>     then:  inspect view
Open a transcript in `inspect view` and check: did it call the tool? with the right argument? how many steps?
"""
from inspect_ai import Task, task
from inspect_ai.agent import react
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.tool import tool

PRICES = {"pencil": "1.20", "notebook": "4.50", "ruler": "2.10"}   # fake data

@tool
def lookup_price():
    async def execute(item: str):
        """Look up the price of a stationery item.

        Args:
            item: The item name, for example "pencil".
        """
        return PRICES.get(item.lower(), "unknown item")
    return execute

@task
def agent_eval():
    return Task(
        dataset=[
            Sample(input="What does a notebook cost? Use the tool, then give the price.", target="4.50"),
            Sample(input="What does a ruler cost? Use the tool, then give the price.", target="2.10"),
            Sample(input="What does a stapler cost? Use the tool. If it is unknown, say unknown.", target="unknown"),
        ],
        solver=react(tools=[lookup_price()], attempts=1),
        scorer=includes(),
        message_limit=12,       # a step limit: report how many runs hit it
    )
