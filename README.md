# VickyAI 🐾 | Your Private Local AI Companion

<div align="center">

<img src="frontend/src/assets/vicky/vicky_logo.png" alt="VickyAI Logo" width="180" style="border-radius: 2rem; margin-bottom: 1rem;" />

### A private, self-hosted AI companion inspired by Vicky the yellow Labrador.
**Runs 100% locally on your home network — zero cloud telemetry, lightning fast, and multimodal.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-24.0+-blue.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-black.svg?logo=ollama&logoColor=white)](https://ollama.com/)

[**Quick Start**](#-quick-start-in-3-steps) • [**Features**](#-features) • [**Architecture**](#-architecture) • [**Configuration**](#-configuration) • [**Troubleshooting**](#-troubleshooting--faq)

</div>

---

## 🌟 Overview

**VickyAI** transforms your home server or local machine into a private, ChatGPT/Claude-grade AI workstation. It connects seamlessly to **Ollama** running on your local network (LAN) or host machine, providing a sleek, responsive, and friendly conversational interface with persistent chat history, multimodal image analysis, and deep code reasoning.

Whether running on a dedicated home server, a GPU workstation, or a mini PC, your conversations and image uploads **never leave your private network**.

---

## 🐶 Features

### 🎨 Modern, Premium Interface
- **Living Mascot Identity**: Vicky reacts dynamically to conversations with 12 distinct facial expressions (Happy, Thinking, Curious, Excited, Wink, etc.) and activity scenes (Coding, Reading, Brainstorming, Sleeping).
- **Interactive Home Screen**: Tap Vicky to cycle through activity modes, enjoy ambient floating particles, and filter quick prompts with category tabs.
- **ChatGPT-Inspired UX**: Clean sidebar navigation, real-time debounced conversation search, archive & rename management, and multi-line markdown rendering.
- **Mobile First & Responsive**: Clamped, touch-friendly UI designed for phones, tablets, and wide desktop screens. Includes auto-closing mobile drawers and a responsive model selector.
- **Theme Engine**: Seamless switching between **Dark**, **Light**, and **System** themes.

### ⚡ Dual-Engine Intelligence
- **Gemma 3 4B**: Fast, lightweight general conversational assistant optimized for rapid answers and multimodal image analysis.
- **Qwen 3 4B**: Advanced reasoning engine equipped for deep logic, complex code generation, debugging, and step-by-step thinking breakdown.
- **Dynamic Model Discovery**: Automatically discovers any additional models installed in your Ollama library on startup.

### 👁️ True Multimodal Vision
- **Drag & Drop / File Picker**: Upload images (PNG, JPEG, WEBP) directly into the composer.
- **Image Previews & Lightbox**: Interactive thumbnails with full-screen lightbox modal and zoom capabilities.
- **Permanent Attachment Persistence**: Images are securely hashed with UUIDs, stored on disk, linked to PostgreSQL message records, and delivered to vision-capable models via base64 encoding.

### 🌊 Real-Time Streaming & Code Intelligence
- **Unbuffered SSE Streaming**: Real-time word-by-word token generation with immediate stop controls (`AbortController`).
- **Syntax Highlighting**: Pre-configured code blocks supporting Python, JavaScript, TypeScript, SQL, Bash, HTML/CSS, JSON, and YAML with one-click clipboard copying.
- **Performance Telemetry**: Live generation time, token counters, and model attribution chips on every assistant reply.

### 🔒 Enterprise Security & Isolation
- **100% Private & Self-Hosted**: Zero third-party cloud API dependencies.
- **Bcrypt Password Security**: Passwords hashed with salted bcrypt (12 rounds).
- **JWT Authentication**: Secure Bearer tokens with isolated user namespaces (users can only access their own conversations and files).
- **Path Traversal Protection**: Uploaded files undergo MIME inspection, Pillow integrity verification, and safe UUID storage.

---

## 📐 Architecture

VickyAI uses a containerized multi-tier microservices architecture orchestrated via Docker Compose:

```
┌────────────────────────────────────────────────────────┐
│               Client (Desktop / Mobile)               │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (Port 3080)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Nginx Reverse Proxy                  │
│       - Static assets caching                          │
│       - Unbuffered SSE streaming proxy                 │
│       - File upload size limits (15MB)                 │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       /api/*   ▼               /*       ▼
┌────────────────────────┐      ┌────────────────────────┐
│     FastAPI Backend    │      │  React + Vite Frontend │
│  - Python 3.12 async   │      │  - Tailwind CSS        │
│  - SQLAlchemy (Async)  │      │  - Lucide Icons        │
│  - Alembic migrations  │      │  - Highlight.js        │
└───────────┬────────────┘      └────────────────────────┘
            │
            ├──────────────────────────┐
            ▼                          ▼
┌────────────────────────┐   ┌───────────────────────────┐
│     PostgreSQL 16      │   │   Ollama Host (Over LAN)  │
│  - Users & auth        │   │   - GTX / RTX GPU / CPU   │
│  - Conversations       │   │   - http://<IP>:11434     │
│  - Messages & images   │   │   - Gemma 3 4B & Qwen 3 4B│
└────────────────────────┘   └───────────────────────────┘
```

> [!TIP]
> **Why run Ollama outside Docker?**
> Running Ollama on the host machine (or on a dedicated GPU server on your LAN) allows it to directly utilize your physical GPU (NVIDIA CUDA, Apple Metal, or AMD ROCm) without complex containerized GPU passthrough.

---

## 📋 Prerequisites

Before deploying VickyAI, ensure you have:

1. **Docker & Docker Compose**:
   - Docker 24.0+
   - Docker Compose v2+
2. **Ollama Instance**:
   - Running locally or on a machine on your LAN.
   - Models pulled:
     ```bash
     ollama pull gemma3:4b
     ollama pull qwen3:4b
     ```
   - Ensure Ollama allows LAN connections by setting `OLLAMA_HOST=0.0.0.0:11434`.

---

## 🚀 Quick Start in 3 Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/abelgeostan/VickyAI.git
cd VickyAI
```

### Step 2: Configure Environment Variables
Copy the template configuration:
```bash
cp .env.example .env
```

Open `.env` and configure your Ollama endpoint and desired port:
```env
# Port to expose VickyAI on your host / home server
PORT=3080

# Address of your Ollama machine (LAN IP or host.docker.internal)
OLLAMA_BASE_URL=http://192.168.1.24:11434

# Secret key for JWT session tokens (generate a strong random string)
JWT_SECRET_KEY=change_this_to_a_secure_random_string_in_production
```

### Step 3: Launch with Docker Compose
```bash
docker compose up -d --build
```

That's it! Open your browser and visit:
```
http://localhost:3080
```
*(Or from any phone, laptop, or tablet on your network: `http://<your-server-ip>:3080`)*

---

## ⚙️ Configuration Reference

All settings can be customized in `.env`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3080` | External port exposed by Nginx on your host machine |
| `OLLAMA_BASE_URL` | `http://192.168.1.24:11434` | Network URL where Ollama is reachable |
| `POSTGRES_USER` | `vickyai` | PostgreSQL database username |
| `POSTGRES_PASSWORD` | `vickyai_secure_pass` | PostgreSQL database password |
| `POSTGRES_DB` | `vickyai` | PostgreSQL database name |
| `JWT_SECRET_KEY` | *(auto-generated)* | Cryptographic secret for signing auth tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Session lifetime (defaults to 7 days) |
| `DEFAULT_MODEL` | `gemma3:4b` | Default model selected for new conversations |

---

## 🛠️ Docker Management & Cheat Sheet

```bash
# View running containers and health status
docker compose ps

# Follow logs across all containers
docker compose logs -f

# Follow backend logs specifically
docker compose logs -f backend

# Rebuild and restart after pulling code updates
docker compose up -d --build

# Restart all services
docker compose restart

# Gracefully stop the application
docker compose down

# Stop and wipe database data / persistent volumes (caution!)
docker compose down -v
```

---

## 🧪 Testing & Health Verification

### Check Stack Health
Query the health check endpoint from any terminal:
```bash
curl http://localhost:3080/api/health
```
Expected output:
```json
{
  "status": "healthy",
  "database": "connected",
  "ollama": "connected"
}
```

### Test Vision Pipeline
To verify end-to-end multimodal image upload, database persistence, and vision analysis with Gemma:
```bash
python verify_vision.py
```

### Interactive API Documentation
FastAPI provides automatic interactive OpenAPI documentation:
- **Swagger UI**: `http://localhost:3080/docs`
- **ReDoc**: `http://localhost:3080/redoc`

---

## 🧭 Project Structure

```
VickyAI/
├── docker-compose.yml              # Multi-container orchestration definition
├── .env.example                    # Environment configuration template
├── README.md                       # Documentation
├── verify_vision.py                # Automated multimodal vision verification script
├── backend/
│   ├── Dockerfile                  # Python 3.12 slim container
│   ├── requirements.txt            # Python dependencies (FastAPI, SQLAlchemy, etc.)
│   ├── alembic.ini                 # Database migration configuration
│   ├── alembic/                    # Auto-applied database schema migrations
│   └── app/
│       ├── main.py                 # FastAPI application factory
│       ├── config.py               # Pydantic environment validation
│       ├── database.py             # Async database engine & session pool
│       ├── models/                 # SQLAlchemy ORM models (User, Conv, Message, Attachment)
│       ├── schemas/                # Pydantic request/response schemas
│       ├── routers/                # API routers (auth, chat, conversations, models, uploads)
│       ├── services/               # Core business services (Ollama, Upload, Auth, Chat)
│       └── repositories/           # Database access layer
├── frontend/
│   ├── Dockerfile                  # Multi-stage production build container
│   ├── package.json                # Dependencies (React 18, Vite, Lucide, Tailwind)
│   ├── tailwind.config.js          # Custom theme, brand gradients, and animation keyframes
│   └── src/
│       ├── assets/vicky/           # Vicky character art, emotions & activity scenes
│       ├── components/
│       │   ├── chat/               # MessageList, Composer, ModelSelector, WelcomeScreen
│       │   ├── sidebar/            # Conversation drawer, history items, search
│       │   ├── settings/           # Theme toggle, defaults & user preferences
│       │   └── common/             # AuthModal & UI primitives
│       ├── services/               # Axios/Fetch clients & SSE streaming handlers
│       └── stores/                 # Client-side settings & theme state
└── nginx/
    ├── Dockerfile                  # Nginx reverse proxy image
    └── nginx.conf                  # Optimized proxy with unbuffered SSE streaming
```

---

## ❓ Troubleshooting & FAQ

### Q: Ollama reports "connection refused" or "disconnected".
**A:** By default, Ollama only listens on `127.0.0.1` (localhost). To allow other machines or Docker containers to connect:
1. **Linux (systemd)**: Edit `/etc/systemd/system/ollama.service.d/override.conf` and add:
   ```ini
   [Service]
   Environment="OLLAMA_HOST=0.0.0.0:11434"
   ```
   Then reload and restart: `sudo systemctl daemon-reload && sudo systemctl restart ollama`.
2. **Windows**: Set a system environment variable `OLLAMA_HOST` with value `0.0.0.0:11434`, then restart Ollama from the system tray.
3. **macOS**: In Terminal, run `launchctl setenv OLLAMA_HOST "0.0.0.0:11434"`, then restart Ollama.

### Q: Can I run VickyAI and Ollama on the exact same computer?
**A:** Yes! In your `.env` file, set:
```env
OLLAMA_BASE_URL=http://host.docker.internal:11434
```
Docker will route requests directly to your host machine's Ollama port.

### Q: Can I expose VickyAI to the internet?
**A:** Yes. Because VickyAI includes built-in authentication, JWT sessions, and isolated user stores, you can securely expose port `3080` through Cloudflare Tunnels, Tailscale, WireGuard, or a reverse proxy like Caddy/Traefik with HTTPS.

### Q: Can I add other models like Llama 3, DeepSeek, or Mistral?
**A:** Absolutely. Pull any model in Ollama:
```bash
ollama pull llama3.2
ollama pull deepseek-r1:7b
```
When you refresh VickyAI, the model selector will automatically discover them and display them in the AI engine dropdown.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and deploy it for personal and commercial applications.

---

<div align="center">
  <b>Built with ❤️ for privacy, local AI, and happy pups everywhere.</b><br/>
  <i>🐾 Vicky is always ready to chat!</i>
</div>
