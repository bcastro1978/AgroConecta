import sys
import os
from dotenv import load_dotenv

# Load env file from the main directory
load_dotenv(os.path.abspath('c:/PERSONAL/IA/AGROCONECTA/.env'))

sys.path.append(os.path.abspath('c:/PERSONAL/IA/AGROCONECTA/agro_agents_api'))

from graph import graph
from langchain_core.messages import HumanMessage

print("Invoking graph...")
state = {"messages": [HumanMessage(content="Hola, necesito información de clima en Quevedo.")]}

try:
    for event in graph.stream(state):
        for key, value in event.items():
            print(f"Node: {key}")
            print(f"State Delta: {value}")
except Exception as e:
    import traceback
    traceback.print_exc()
