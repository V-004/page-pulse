# ⚡ Page Pulse — Web Audit & SEO Health Engine

> A high-performance, full-stack website auditing platform built to analyze any public webpage URL for status codes, response times, meta descriptions, H1 headings, image alt attributes, and word counts.

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-blue.svg)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Python%20%7C%20Flask-emerald.svg)](https://flask.palletsprojects.com)

---

## 📌 Project Overview

**Page Pulse** is a production-ready solution designed for digital marketers, web developers, and SEO analysts to perform instant technical audits on any public website. By sending a request to the backend engine, Page Pulse analyzes the live HTML content, measures server speed, extracts critical SEO indicators, and identifies accessibility flaws (such as images missing alternative text).

---

## ✨ Features

### 🎯 Core Audit Metrics
- **HTTP Status Code Verification**: Returns standard status codes (200, 301, 404, etc.) with color-coded health indicators.
- **Response Time Measurement**: Accurate millisecond-level server response time tracking with performance ratings (*Fast < 300ms*, *Moderate < 1000ms*, *Slow > 1000ms*).
- **Page Title Extraction & Character Count**: Extracts `<title>` tag content and validates whether it falls within optimal SEO length (30-60 chars).
- **Meta Description Audit**: Identifies `<meta name="description">` or `<meta property="og:description">` text and evaluates character count against SERP standards (120-160 chars).
- **H1 Tag Counting**: Counts primary `<h1>` headings to ensure standard single-H1 usage.
- **Image Alt Attribute Inspector**: Detects all `<img>` tags and counts images with missing, empty, or whitespace-only `alt` attributes.
- **Word Count Calculator**: Cleans noise (`<script>`, `<style>`, `<noscript>`, `<svg>`) and calculates approximate non-empty word counts.

### 🚀 Bonus Features
- **Favicon Detection**: Automatically extracts and resolves `<link rel="icon">` or defaults to domain `/favicon.ico`.
- **Page Size (KB)**: Calculates total HTML response payload size in kilobytes.
- **Total Image Count**: Tracks total `<img>` tags alongside missing alt counts.
- **LocalStorage Audit History**: Remembers the last 5 audited websites with quick reload actions.
- **Copy JSON Report**: One-click clipboard copy of the audit payload.
- **Download Report as JSON**: Exports formatted `.json` report files.
- **Animated UI Cards**: Smooth entrance transitions powered by `motion/react`.
- **Responsive Dark/Light Mode**: Full dark mode compatibility.

---

## 🛠️ Tech Stack

### Backend
- **Python 3.10+**
- **Flask** (RESTful API microframework)
- **Flask-CORS** (Cross-Origin Resource Sharing)
- **BeautifulSoup4 & lxml** (HTML parsing engine)
- **requests / urllib** (HTTP client with timeout handling)
- **Gunicorn** (Production WSGI HTTP Server)

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS v4** (Utility-first styling)
- **Axios** (HTTP Client)
- **Lucide React** (Modern SVG icons)
- **Motion/React** (UI animations)

---

## 📂 Project Structure

```text
page-pulse/
├── backend/
│   ├── app.py              # Flask REST API entry point & error handlers
│   ├── utils.py            # URL validation, HTTP requester & HTML audit engine
│   ├── requirements.txt    # Python package dependencies for production
│   └── Procfile            # Deployment configuration for Render / Heroku
├── frontend/
│   ├── src/
│   │   ├── components/     # Header, AuditForm, ResultsView, HistoryDrawer, SettingsModal, Footer
│   │   ├── pages/          # HomePage state orchestrator
│   │   ├── services/       # Axios API client wrapper
│   │   ├── types/          # TypeScript interface definitions
│   │   ├── App.tsx         # Root component
│   │   ├── main.tsx        # React entry point
│   │   └── index.css       # Tailwind CSS entry
│   └── package.json        # Frontend NPM manifest
├── server.ts               # Production Express + Vite fullstack server
├── metadata.json           # Application manifest
└── README.md               # Complete documentation
```

---

## 🔌 API Documentation

### `POST /audit`

Audits a public webpage URL and returns technical SEO metrics.

#### **Request Body**
```json
{
  "url": "https://example.com"
}
```

#### **Success Response (200 OK)**
```json
{
  "status": 200,
  "response_time_ms": 152,
  "page_title": "Example Domain",
  "meta_description": "Example Domain description...",
  "h1_count": 1,
  "images_missing_alt": 2,
  "word_count": 453,
  "total_images": 5,
  "page_size_kb": 12.4,
  "favicon": "https://example.com/favicon.ico"
}
```

#### **Error Responses**

| HTTP Code | Error Message | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `{"error": "Invalid URL"}` | Submitted URL is malformed or lacks scheme/netloc |
| `408 Request Timeout` | `{"error": "Request timed out"}` | Target website failed to respond within 10 seconds |
| `502 Bad Gateway` | `{"error": "Unable to reach website"}` | DNS resolution failure or network connection refused |
| `415 Unsupported Media` | `{"error": "URL is not an HTML page"}` | Content-Type header does not contain `text/html` |
| `500 Internal Error` | `{"error": "Internal server error"}` | Unexpected backend error handled without crashing |

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Backend Setup (Flask)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server locally
python app.py
```
The Flask backend will run on `http://localhost:5000`.

### 2. Frontend Setup (React / Vite)

```bash
# In the project root or frontend directory
npm install

# Start local Vite development server
npm run dev
```
The app will be accessible at `http://localhost:3000`.

---

## 🌐 Deployment Instructions

### Deploying Backend to Render

1. Log in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository containing the `backend/` folder.
3. Configure the service settings:
   - **Name**: `page-pulse-backend`
   - **Environment**: `Python 3`
   - **Root Directory**: `backend` (or `page-pulse/backend`)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
4. Click **Create Web Service**. Once deployed, copy your live backend URL (e.g., `https://page-pulse-backend.onrender.com`).

---

### Deploying Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
2. Import your GitHub repository.
3. Configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Environment Variables:
   - Add `VITE_BACKEND_URL` with your Render backend URL (e.g. `https://page-pulse-backend.onrender.com`).
5. Click **Deploy**.

---

## 📸 Screenshots & Live Demo

- **Live Demo**: `https://page-pulse.vercel.app` *(Placeholder)*
- **GitHub Repository**: `https://github.com/username/page-pulse` *(Placeholder)*

---

## 📄 License & Credits

Built with precision for the **Digital Heroes Training Task**.

🔗 **Official Link**: [Built for Digital Heroes Training Task](https://digitalheroesco.com)
