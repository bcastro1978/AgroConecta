import os
from dotenv import load_dotenv

load_dotenv(os.path.abspath('c:/PERSONAL/IA/AGROCONECTA/.env'))

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import logging
import httpx

logging.basicConfig(level=logging.DEBUG)

print("GOOGLE_API_KEY is set:", bool(os.environ.get("GOOGLE_API_KEY")))

llm = ChatGoogleGenerativeAI(model="gemini-2.5-pro", temperature=0)
try:
    print("Invoking LLM...")
    response = llm.invoke([HumanMessage(content="Hola, di 'test ok'")])
    print("Response:", response.content)
except Exception as e:
    print("Error calling LLM:", e)
    import traceback
    traceback.print_exc()
