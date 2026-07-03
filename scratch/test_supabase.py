import sys
import os

sys.path.append(os.path.abspath('c:/PERSONAL/IA/AGROCONECTA/agro_agents_api'))

from main import get_state

print("Testing get_state...")
try:
    state = get_state("test_user_123")
    print("State returned:", state)
except Exception as e:
    import traceback
    traceback.print_exc()
