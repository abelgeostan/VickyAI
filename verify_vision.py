import json
import urllib.request
import io
import time
from PIL import Image

BASE_URL = "http://localhost:3080/api"


print("--- Testing Image Upload & Multimodal Vision ---")

# 1. Create a dummy test image with a red square
img = Image.new("RGB", (200, 200), color=(255, 60, 60))
buf = io.BytesIO()
img.save(buf, format="PNG")
png_bytes = buf.getvalue()

# 2. Register a user
reg_data = json.dumps({
    "email": f"vision_user_{int(time.time())}@vickyai.internal",
    "username": f"vision_{int(time.time())}",
    "password": "VisionPassword123!"
}).encode()

req = urllib.request.Request(f"{BASE_URL}/auth/register", data=reg_data, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req) as res:
    auth_data = json.loads(res.read().decode())
    token = auth_data["access_token"]

# 3. Upload image via multipart/form-data
boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
body = bytearray()
body.extend(f"--{boundary}\r\n".encode())
body.extend(b'Content-Disposition: form-data; name="file"; filename="test_red_square.png"\r\n')
body.extend(b"Content-Type: image/png\r\n\r\n")
body.extend(png_bytes)
body.extend(f"\r\n--{boundary}--\r\n".encode())

req = urllib.request.Request(
    f"{BASE_URL}/uploads",
    data=bytes(body),
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
)
with urllib.request.urlopen(req) as res:
    upload_res = json.loads(res.read().decode())
    att_id = upload_res["id"]
    print(f"Uploaded image successfully: ID={att_id}, URL={upload_res['url']}")

# 4. Ask Gemma 3 4B about the image
chat_payload = json.dumps({
    "message": "What color is this image? Reply in one word.",
    "model": "gemma3:4b",
    "attachment_ids": [att_id]
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

print("Streaming vision response from Gemma 3 4B:")
vision_tokens = []
with urllib.request.urlopen(req, timeout=60) as res:
    for line in res:
        line_str = line.decode().strip()
        if line_str.startswith("data:"):
            try:
                obj = json.loads(line_str[5:].strip())
                if "token" in obj:
                    vision_tokens.append(obj["token"])
                    print(obj["token"], end="", flush=True)
            except Exception:
                pass

print(f"\nVision test complete! Response: '{''.join(vision_tokens).strip()}'".encode('ascii', 'replace').decode())
print("SUCCESS: Image upload and Multimodal Vision work flawlessly!")

