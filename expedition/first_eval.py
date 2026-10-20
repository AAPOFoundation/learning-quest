"""Expedition stage 1: your first eval. Replace the sample questions with 10 of your own.
Dry run (free):   inspect eval first_eval.py --model mockllm/model
Real model:       inspect eval first_eval.py --model <provider/model>     then:  inspect view
"""
from inspect_ai import Task, task
from inspect_ai.dataset import Sample
from inspect_ai.scorer import includes
from inspect_ai.solver import generate

QUESTIONS = [
    ("What is the capital city of Australia?", "Canberra"),
    ("Which ocean lies to the east of Australia?", "Pacific"),
    ("Which planet is known as the Red Planet?", "Mars"),
    # add 7 more here: a question and a short, distinctive answer.
    # includes() matches text inside the reply, so a very short target (like "Au") can match by accident.
]

@task
def first_eval():
    return Task(
        dataset=[Sample(input=q, target=a) for q, a in QUESTIONS],
        solver=generate(),
        scorer=includes(),
    )
