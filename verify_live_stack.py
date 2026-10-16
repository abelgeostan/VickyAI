import json
import urllib.request
import urllib.parse
import time
import io
from PIL import Image

BASE_URL = "http://localhost:3080/api"


print("--- 1. Testing Health Endpoint ---")
req = urllib.request.Request(f"{BASE_URL}/health")
with urllib.request.urlopen(req, timeout=5) as res:
    health = json.loads(res.read().decode())
    print("Health response:", health)
    assert health["status"] == "healthy"
    assert health["database"] == "connected"
    assert health["ollama"] == "connected"

print("\n--- 2. Testing User Registration ---")
reg_data = json.dumps({
    "email": f"tester_{int(time.time())}@vickyai.internal",
    "username": f"vicky_{int(time.time())}",
    "password": "SecurePassword2026!"
}).encode()

req = urllib.request.Request(
    f"{BASE_URL}/auth/register",
    data=reg_data,
    headers={"Content-Type": "application/json"}
)
with urllib.request.urlopen(req, timeout=5) as res:
    auth_data = json.loads(res.read().decode())
    token = auth_data["access_token"]
    user_id = auth_data["user"]["id"]
    print(f"Registered user: {auth_data['user']['username']} (ID: {user_id})")

auth_headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

print("\n--- 3. Testing Conversation Creation ---")
conv_data = json.dumps({
    "title": "Vicky Live Test Chat",
    "model": "gemma3:4b"
}).encode()
req = urllib.request.Request(f"{BASE_URL}/conversations", data=conv_data, headers=auth_headers)
with urllib.request.urlopen(req, timeout=5) as res:
    conv = json.loads(res.read().decode())
    conv_id = conv["id"]
    print(f"Created conversation: '{conv['title']}' (ID: {conv_id})")

print("\n--- 4. Testing SSE Streaming Chat (Gemma 3 4B) ---")
chat_payload = json.dumps({
    "conversation_id": conv_id,
    "message": "Hello Vicky! Introduce yourself in 2 short sentences.",
    "model": "gemma3:4b"
}).encode()

req = urllib.request.Request(
    f"{BASE_URL}/chat/stream",
    data=chat_payload,
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream"
    }
)

tokens_received = []
with urllib.request.urlopen(req, timeout=60) as res:
    for line in res:
        line_str = line.decode().strip()
        if line_str.startswith("data:"):
            data_str = line_str[5:].strip()
            try:
                data_obj = json.loads(data_str)
                if "token" in data_obj:
                    tokens_received.append(data_obj["token"])
                    print(data_obj["token"], end="", flush=True)
                elif "title" in data_obj:
                    print(f"\n[Generated Title: '{data_obj.get('title')}']")
            except Exception:
                pass

full_streamed = "".join(tokens_received)
print(f"\nStream complete! Total tokens streamed: {len(tokens_received)}")
assert len(full_streamed) > 0, "No content streamed!"

print("\n--- 5. Testing Persistence (Retrieving Conversation Detail) ---")
req = urllib.request.Request(f"{BASE_URL}/conversations/{conv_id}", headers=auth_headers)
with urllib.request.urlopen(req, timeout=5) as res:
    detail = json.loads(res.read().decode())
    print(f"Conversation messages saved in PostgreSQL: {len(detail['messages'])}")
    for m in detail["messages"]:
        print(f"  - [{m['role'].upper()}]: {m['content'][:60]}... (Model: {m.get('model')})")
    assert len(detail["messages"]) >= 2, "Messages not persisted properly in PostgreSQL!"

print("\n--- 6. Testing Frontend Web Server ---")
req = urllib.request.Request("http://localhost:3080/")

with urllib.request.urlopen(req, timeout=5) as res:
    html = res.read().decode()
    print(f"Frontend index.html fetched successfully (length: {len(html)} bytes)")
    assert "VickyAI" in html, "HTML title or branding missing!"

print("\n[SUCCESS] ALL LIVE STACK TESTS PASSED WITH 100% SUCCESS!")
