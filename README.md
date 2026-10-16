# VickyAI 🐾 | Your Personal Local AI Companion

![VickyAI Logo](frontend/src/assets/vicky/vicky_logo.png)

> **VickyAI** is a ChatGPT-like personal AI assistant service running locally on your home LAN, featuring **Vicky the yellow Labrador** as the mascot and visual identity.

---

## 🌟 Highlights

- **🐶 VickyAI Avatar System**: Dynamic facial expressions and activity scenes cropped directly from the master character sheet (Happy, Thinking, Sad, Excited, Curious, Wink, Laugh, Confused, Waving, Coding, Reading, Sleeping).
- **⚡ Dual AI Engine Architecture**:
  - **Gemma 3 4B**: Fast, lightweight, general-purpose conversations & multimodal image/vision analysis.
  - **Qwen 3 4B**: Deep reasoning, code synthesis, logic, and agent-ready planning.
- **🌊 Progressive SSE Streaming**: Unbuffered Server-Sent Events with stop generation control and real-time token rendering.
- **🖼️ Multimodal Vision**: Drag-and-drop and image attachments (PNG, JPEG, WEBP up to 10MB) with model capability validation.
- **💾 PostgreSQL Persistence**: Real-time message storage, conversation branch editing, archiving, and debounced full-text search.
- **🔐 Local Authentication**: Secure bcrypt password hashing, JWT session authorization, and multi-user data isolation.
- **🎨 Modern ChatGPT-Style UI**: Desktop, tablet, and mobile responsive with Light, Dark, and System theme support.
- **🐳 Full Docker Deployment**: Fully containerized stack with healthchecks, persistent volumes, and Nginx reverse proxy.
- **🚀 Future Agent Architecture**: Tool registry, role permissions, approval requests, and audit logging.

---

## 📐 Architecture

The application runs on the host server (**VICKY/MSI**) and communicates over the local network (LAN) with the external **Acer AI machine** hosting Ollama with a dedicated GTX 1650 Ti GPU:

```
Browser (Desktop / Mobile)
        ↓
    Nginx (Port 3080)
  ┌─────┴────────────────────────┐
  ↓                              ↓
Frontend (React + Vite)      Backend (FastAPI)
                                 ↓
                            PostgreSQL 16
                                 ↓
                     Ollama REST API over LAN
                                 ↓
                     Acer: 192.168.1.24:11434
                                 ↓
                     ┌───────────┴───────────┐
                     ↓                       ↓
                 Gemma 3 4B              Qwen 3 4B
               (Vision/Fast)         (Reasoning/Code)
```

> [!IMPORTANT]
> **Ollama runs OUTSIDE of Docker** on the Acer AI machine to directly utilize the physical GPU. VickyAI connects to Ollama over the local network via `OLLAMA_BASE_URL`.

---

## 📋 Prerequisites

- **Docker** 24.0+ and **Docker Compose** v2+
- Network access to the Ollama host (default: `http://192.168.1.24:11434`)
- Both models pulled on Ollama:
  ```bash
  ollama pull gemma3:4b
  ollama pull qwen3:4b
  ```

---

## 🚀 Quick Start (Production Mode)

### 1. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `OLLAMA_BASE_URL` points to your Ollama machine and set your chosen port (defaults to `3080`):
```env
OLLAMA_BASE_URL=http://192.168.1.24:11434
PORT=3080
```

### 2. Start the Application
Build and start all containers in the background:
```bash
docker compose up -d --build
```

### 3. Check Service Status
```bash
docker compose ps
```

All 4 services will report `healthy` or `Up`:
- `vickyai_nginx` (Port `3080`)
- `vickyai_frontend` (Port `3000` internal)
- `vickyai_backend` (Port `8000` internal)
- `vickyai_postgres` (Port `5432` internal)

### 4. Access VickyAI
Open your web browser and navigate to:
```
http://localhost:3080
```
or from another device on your LAN:
```
http://<VICKY-SERVER-IP>:3080
```


---

## 🛠️ Docker Operations

| Command | Description |
|---|---|
| `docker compose up -d --build` | Build images and start all services in background |
| `docker compose ps` | Check container health and running status |
| `docker compose logs -f` | Tail logs across all services |
| `docker compose logs -f backend` | View backend logs and API requests |
| `docker compose restart` | Restart all application containers |
| `docker compose down` | Stop and remove application containers |
| `docker compose down -v` | Stop containers and wipe PostgreSQL/upload volumes |

---

## 🧪 Testing & Verification

### 1. Test Ollama Reachability from Docker
Verify that the backend container can reach the Acer machine over LAN:
```bash
docker compose exec backend curl -s http://192.168.1.24:11434/api/tags
```
You should see JSON listing `gemma3:4b` and `qwen3:4b`.

### 2. Health Endpoint
Inspect the combined health check:
```bash
curl http://localhost/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "database": "connected",
  "ollama": "connected"
}
```

### 3. Running Backend Unit & Integration Tests
Run pytest in the project directory:
```bash
pytest backend/app/tests -v
```
Test suite verifies:
- User registration, duplicate checks, login, and JWT authentication
- Multi-user isolation (User B cannot access or modify User A's conversations)
- Conversation creation, listing, updating, archiving, and deletion
- Model listing and capability metadata (Vision & Thinking flags)
- Image upload validation (PNG, JPEG, WEBP, size limits)
- External Ollama LAN connectivity

---

## 💡 Model Capabilities & Guidelines

| Model | Badge | Capabilities | Best Used For |
|---|---|---|---|
| **Gemma 3 4B** | ⚡ Fast • General • Vision | Completion, Multimodal Vision | Everyday queries, quick answers, analyzing attached images |
| **Qwen 3 4B** | 🧠 Reasoning • Coding • Agentic | Completion, Tools, Thinking | Python/JS programming, complex algorithms, mathematical proofs |

> [!NOTE]
> If you attach an image while **Qwen 3 4B** is selected, VickyAI will display a helpful banner advising you to switch to **Gemma 3 4B**. The application will never send image data to incompatible models.

---

## 🔒 Security & Data Isolation

- **Password Security**: Passwords are encrypted using salted bcrypt hashing with 12 rounds. Plaintext passwords are never logged or stored.
- **Upload Safety**: Files undergo MIME validation and Pillow integrity checks. Filenames are assigned random UUIDs to eliminate path traversal attacks.
- **Safe Error Responses**: Internal stack traces and database credentials are obfuscated from the UI.
- **User Data Isolation**: Queries strictly enforce `user_id` ownership filters on conversations, messages, and attachments.

---

## 🧭 Project Layout

```
vickyai/
├── docker-compose.yml          # Container configuration
├── .env.example                # Environment variables template
├── README.md                   # Complete documentation
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/                # Database migrations
│   └── app/
│       ├── main.py             # FastAPI entrypoint
│       ├── config.py           # Pydantic Settings
│       ├── database.py         # Async SQLAlchemy & asyncpg
│       ├── models/             # User, Conversation, Message, Attachment
│       ├── schemas/            # Pydantic validation schemas
│       ├── routers/            # Auth, Chat, Conversations, Models, Uploads, Health
│       ├── services/           # OllamaService, AuthService, ConversationService, UploadService
│       ├── repositories/       # UserRepo, ConversationRepo, MessageRepo
│       ├── ai/                 # ModelRouter & Future Agent Architecture
│       ├── auth/               # JWT utilities & FastAPI dependencies
│       └── tests/              # Pytest test suite
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── assets/vicky/       # Master sheet & cropped avatar poses
│       ├── components/
│       │   ├── chat/           # Composer, MessageList, ModelSelector, WelcomeScreen
│       │   ├── sidebar/        # Sidebar, ConversationList, ConversationItem
│       │   ├── vicky/          # VickyAvatar, VickyScene, VickyStatusBadge
│       │   └── settings/       # SettingsModal
│       ├── services/           # api, auth, chat (SSE), conversation, upload, model
│       └── stores/             # settingsStore (Light/Dark/System themes)
└── nginx/
    ├── Dockerfile
    └── nginx.conf              # Streaming SSE proxy configuration
```

---

## 🐾 Mascot & Avatar Asset Guide

Vicky the yellow Labrador is represented with 12 distinct avatar emotions and 6 activity scenes extracted from the master asset sheet:

- **Happy**: Standard cheerful assistant messages
- **Thinking**: Displayed when the model is reasoning or streaming
- **Sad**: Displayed when an error or network drop occurs
- **Excited**: Congratulatory and success states
- **Curious**: Clarifications and exploratory questions
- **Waving**: Welcome and onboarding screen
- **Coding**: Technical developer advice and code analysis
- **Reading**: Research, learning, and in-depth conceptual summaries

---

## 🛠️ Local Development (Without Docker)

### Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000`.
