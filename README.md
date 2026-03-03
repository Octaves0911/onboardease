# OnboardEase

An AI-powered employee onboarding platform that streamlines the new-hire experience through intelligent task management, mentorship tracking, and real-time collaboration.

---

## Overview

OnboardEase connects HR teams, managers, mentors, and new hires in a single unified platform. It leverages AI (via LangGraph + LangChain) to auto-generate personalised onboarding task plans, and provides interactive tools like a live code playground and an AI chat assistant to accelerate ramp-up time.

---

## Features

| Feature | Description |
|---|---|
| **Role-based dashboards** | Separate views for New Hire, Mentor, Admin, and HR |
| **AI Task Builder** | LangGraph-powered onboarding task generation from job role or resume |
| **Bulk Task Generation** | Generate full onboarding plans in one click |
| **Code Playground** | Monaco editor + real PTY bash terminal via WebSocket |
| **AI Chat (OnboardBot)** | Context-aware assistant powered by GPT-5 |
| **Mail Playground** | Simulate email-based onboarding communication |
| **PDF Viewer** | View onboarding documents inline |
| **Employee & Mentor Management** | Add, assign, and track employees and mentors |
| **Profile Management** | User profiles with role-specific settings |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** — build tooling & dev server
- **Tailwind CSS** — utility-first styling
- **React Router v6** — client-side routing
- **Monaco Editor** — VS Code-grade in-browser editor
- **xterm.js** — terminal emulator in the browser
- **Axios** — HTTP client

### Backend (`onboarding-agent/`)
- **FastAPI** — REST API + WebSocket server
- **Uvicorn** — ASGI server
- **LangGraph** + **LangChain** — agentic AI workflows
- **Python-dotenv** — environment configuration
- **PyPDF2** — resume/PDF parsing
- **ptyprocess** — real PTY shell for the code playground terminal

---

## Project Structure

```
onboardease/               # React/Vite frontend
├── src/
│   ├── pages/             # Route-level page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NewHirePage.tsx
│   │   ├── MentorPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── HRPage.tsx
│   │   └── SetupPage.tsx
│   ├── components/
│   │   ├── common/        # Navbar, shared UI
│   │   ├── dashboard/     # Role-specific dashboard panels
│   │   ├── landing/       # Landing page sections
│   │   ├── modals/        # Feature modals (AI builder, playground, etc.)
│   │   ├── chat/          # OnboardBot chat widget
│   │   └── setup/         # Onboarding setup flow
│   ├── context/           # Global app state (AppContext)
│   └── services/          # AI service integrations
├── vite.config.ts
└── package.json

onboarding-agent/          # Python FastAPI backend
├── main.py                # FastAPI app, REST endpoints, WebSocket PTY
├── agent.py               # LangGraph onboarding agent
├── models.py              # Pydantic request/response models
├── requirements.txt
└── .env                   # PORT configuration
```

---

## Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.12
- pip

### Frontend Setup

```bash
cd onboardease
npm install
npm run dev          # development server
npm run build        # production build
```

### Backend Setup

```bash
cd onboarding-agent
pip install -r requirements.txt
```

Create a `.env` file:

```env
PORT=3016
```

Start the backend:

```bash
python3 main.py
```

The API will be available at `http://localhost:3016`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/generate` | Generate onboarding tasks from role/context |
| `POST` | `/api/refine` | Refine existing tasks with AI |
| `POST` | `/api/parse-resume` | Extract info from uploaded resume (PDF/TXT) |
| `WS` | `/ws/pty` | WebSocket PTY terminal session |

---

## Environment Variables

### Frontend (`vite.config.ts`)
The Vite dev/preview server proxies `/api` and `/ws` requests to the backend automatically — no extra configuration needed locally.

### Backend (`.env`)
```env
PORT=3016   # Port the FastAPI server listens on
```

---

## Deployment

The application is deployed at:

**https://cxfj5mk6.run.complete.dev**

- Frontend: Vite preview server on port `3031`
- Backend: Uvicorn on port `3016` (internal), proxied through Vite

---

## User Roles

| Role | Access |
|---|---|
| **New Hire** | Personal task dashboard, OnboardBot chat, code playground, document viewer |
| **Mentor** | Assigned new-hire progress tracking, task management |
| **Admin** | Full employee/mentor management, bulk task generation, analytics |
| **HR** | Employee records, onboarding progress overview |

---

## License

Private — All rights reserved.
