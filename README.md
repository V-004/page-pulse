# ⚡ Page Pulse – Web Audit & SEO Health Engine

A full-stack web application that analyzes any public website and generates a technical SEO and accessibility report in seconds.

The application measures response time, validates HTTP status codes, extracts important SEO metadata, and identifies common accessibility issues such as missing image alternative text.

---

## 🚀 Live Demo

**Frontend:** *(Will Add after deployment)*

**Backend API:** *(Will Add after deployment)*

---

## 📷 Screenshots

> Will Add screenshots after deployment.

- Home Page
- Audit Results
- Dark Mode (Optional)

---

# 📖 Project Overview

Page Pulse helps developers, SEO analysts, and digital marketers quickly evaluate the technical health of a website.

Users simply enter a public URL, and the application performs a live audit by requesting the webpage, parsing its HTML, and extracting important technical metrics.

---

# ✨ Features

### Website Analysis

- HTTP Status Code
- Response Time
- Page Title
- Meta Description
- H1 Count
- Word Count

### SEO Checks

- Title Length
- Meta Description Presence
- Missing Image ALT Attributes

### Additional Metrics

- Total Images
- Page Size
- Favicon Detection

### User Experience

- Recent Audit History
- Copy JSON Report
- Download JSON Report
- Responsive UI
- Dark / Light Mode

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios

## Backend

- Python
- Flask
- BeautifulSoup
- Requests
- Flask-CORS

---

# 🏗 System Architecture

```
React Frontend
        │
        ▼
 Flask REST API
        │
        ▼
Website Fetcher
        │
        ▼
BeautifulSoup HTML Parser
        │
        ▼
SEO & Accessibility Analysis
        │
        ▼
JSON Response
```

---

# 📂 Project Structure

```
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
│   └── main.tsx
│
├── package.json
├── package-lock.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── README.md
```

---

# 🔌 REST API

## POST /audit

Request

```json
{
    "url":"https://example.com"
}
```

Successful Response

```json
{
    "status":200,
    "response_time_ms":152,
    "page_title":"Example Domain",
    "meta_description":"Example Description",
    "h1_count":1,
    "images_missing_alt":2,
    "word_count":453
}
```

---

# 💻 Running Locally

## Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on:

```
http://localhost:5000
```

## Frontend

```bash
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🚀 Future Improvements

- Lighthouse Integration
- Broken Link Detection
- Sitemap Validation
- Core Web Vitals
- PDF Report Export
- User Authentication

---

# 👨‍💻 Author

Developed as part of the **Digital Heroes Software Development Assessment**.
