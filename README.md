# ⚡ Page Pulse – Web Audit & SEO Health Engine

A full-stack web application that analyzes any public website and generates a comprehensive technical SEO and accessibility report in seconds.

Page Pulse enables developers, SEO analysts, and digital marketers to evaluate the technical health of websites through a modern React interface powered by a Flask REST API.

---

## 🚀 Live Demo

**Frontend:** *Coming Soon (Deployment in Progress)*

**Backend API:** *Coming Soon (Deployment in Progress)*

---

## 📸 Screenshots

Screenshots will be added after deployment.

- Home Page
- Audit Results
- Dark Mode

---

# 📖 Project Overview

Page Pulse performs a live audit of any publicly accessible website by fetching its HTML content, parsing the webpage, and extracting important SEO and accessibility metrics.

The application provides insights into website performance, metadata quality, heading structure, image accessibility, and content statistics through an intuitive dashboard.

---

# ✨ Features

## 🌐 Website Analysis

- HTTP Status Code Detection
- Response Time Measurement
- Page Title Extraction
- Meta Description Extraction
- H1 Heading Count
- Word Count Analysis

## 🔍 SEO Checks

- Title Length Validation
- Meta Description Presence
- Missing Image ALT Attribute Detection

## 📊 Additional Metrics

- Total Images
- HTML Page Size
- Favicon Detection

## 🎨 User Experience

- Responsive User Interface
- Dark / Light Mode
- Recent Audit History
- Copy JSON Report
- Download JSON Report

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Backend

- Python
- Flask
- BeautifulSoup4
- Requests
- Flask-CORS

---

# 🏗️ System Architecture

```text
                 User
                   │
                   ▼
        React Frontend (Vite)
                   │
            HTTP API Request
                   │
                   ▼
         Flask REST API Backend
                   │
         Fetch Target Website
                   │
                   ▼
      BeautifulSoup HTML Parser
                   │
     SEO & Accessibility Analysis
                   │
                   ▼
            JSON API Response
                   │
                   ▼
          Results Dashboard
```

---

# 📂 Project Structure

```text
page-pulse/
│
├── backend/
│   ├── app.py
│   ├── utils.py
│   ├── requirements.txt
│   └── Procfile
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── server.ts
├── index.html
├── metadata.json
└── README.md
```

---

# 🔌 REST API

## POST `/audit`

Analyzes a public website and returns its SEO and accessibility metrics.

### Request

```json
{
  "url": "https://example.com"
}
```

### Successful Response

```json
{
  "status": 200,
  "response_time_ms": 152,
  "page_title": "Example Domain",
  "meta_description": "Example Description",
  "h1_count": 1,
  "images_missing_alt": 2,
  "word_count": 453,
  "page_size_kb": 12.4
}
```

---

# 💻 Running Locally

## Clone Repository

```bash
git clone <repository-url>
cd page-pulse
```

## Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend

```bash
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 🚀 Future Improvements

- Google Lighthouse Integration
- Broken Link Detection
- Sitemap Validation
- Core Web Vitals Analysis
- PDF Report Export
- User Authentication
- Scheduled Website Monitoring
- Historical Audit Analytics

---

# 👨‍💻 Author

Developed as part of the **Digital Heroes Software Development Assessment** using **React, TypeScript, Flask, and BeautifulSoup**.

---

# 📄 License

This project was created for educational and assessment purposes.