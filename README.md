# Qubixa AI — A Professional All-in-One AI Platform

Qubixa AI is a production-grade, 100% free, responsive AI platform inspired by ChatGPT and modern creative suites. It combines a state-of-the-art conversational interface with 16 specialized AI productivity tools in a single unified web application.

---

## 🇧🇩 CRITICAL: Where to Add Your Google Gemini API Key

> **Important for Beginners:** There is **NO API key input field in the website UI**. The key is configured securely on the server to protect your credentials. You only need to add your key once in the source code.

### Option A: Edit `server/config.ts` Directly (Recommended for Non-Programmers)

1. Open the file located at:
   ```
   server/config.ts
   ```
2. Navigate to **Line 11** where you will see the 🇧🇩 emoji:
   ```typescript
   // ==============================================================================
   // 🇧🇩 PASTE YOUR GOOGLE GEMINI API KEY HERE — THIS IS THE ONLY PLACE TO ADD IT. DO NOT CHANGE OTHER CODE.
   // File: server/config.ts (Line 11)
   // If you do not use a .env file, replace the placeholder below with your Gemini API key:
   // ==============================================================================
   export const MANUAL_GEMINI_API_KEY = "PASTE_YOUR_API_KEY_HERE";
   ```
3. Replace `"PASTE_YOUR_API_KEY_HERE"` with your actual Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey):
   ```typescript
   export const MANUAL_GEMINI_API_KEY = "AIzaSyYourSecretKeyHere...";
   ```
4. Save the file. That's it! Every tool across the platform will now automatically use this key.

### Option B: Use Environment Variables (`.env`)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your key:
   ```env
   GEMINI_API_KEY=AIzaSyYourSecretKeyHere...
   PORT=3000
   ```

---

## 🌟 Platform Capabilities & Tools

Nexora AI features a responsive 3-line hamburger menu opening 19 comprehensive sections:

| # | Navigation Item | Description | Engine / Model |
|---|---|---|---|
| 1 | **New Chat** | Instant shortcut to launch a clean conversation | — |
| 2 | **AI Chat** | ChatGPT-style interface, multiline input, image attachments, markdown code blocks with copy, regenerate | `gemini-3.8-flash` |
| 3 | **AI Writing Assistant** | Articles, blogs, executive emails, product descriptions, essays with tone and length sliders | `gemini-3.8-flash` |
| 4 | **AI Image Prompt Generator** | Turns raw ideas into cinema-grade English prompts with 1-click generator transfer | `gemini-3.8-flash` |
| 5 | **AI Image Analyzer** | Multimodal image inspection: OCR text extraction, composition critique, and object catalog | `gemini-3.8-flash` |
| 6 | **AI Image Generator** | Generates artwork in 5 aspect ratios (1:1, 16:9, 9:16, 4:3, 3:4) with direct download | `gemini-3.1-flash-lite-image` |
| 7 | **AI Photo Editing Assistant** | Applies natural language edit instructions with before/after visual comparison | `gemini-3.1-flash-lite-image` |
| 8 | **AI Code Assistant** | Generates, explains, reviews, and debugs code across 10+ languages with unit test generator | `gemini-3.8-flash` |
| 9 | **PDF Assistant** | Parses documents, extracts executive summaries, and enables interactive document Q&A | `gemini-3.8-flash` |
| 10 | **Document Summarizer** | Condenses text with word count metrics, reduction percentages, and action item lists | `gemini-3.8-flash` |
| 11 | **Language Translator** | Real-time translation between Bengali (বাংলা 🇧🇩), English, and 15+ world languages with phonetics | `gemini-3.8-flash` |
| 12 | **AI Math Assistant** | Step-by-step mathematical problem solver with proofs and explicit verification checks | `gemini-3.8-flash` |
| 13 | **Study Assistant** | Generates study notes, interactive graded practice quizzes with score tracking, and 3D flashcards | `gemini-3.8-flash` |
| 14 | **YouTube Script Generator** | Crafts retention hooks, visual cues, full scripts, descriptions, and SEO tags | `gemini-3.8-flash` |
| 15 | **Social Media Caption Generator** | Creates 3 platform-tailored caption variants, hashtag clusters, and posting tips | `gemini-3.8-flash` |
| 16 | **AI Video Tools** | Shot-by-shot storyboard director & camera motion choreographies for Google Veo 3.1 | `veo-3.1-lite` / `gemini-3.8-flash` |
| 17 | **Chat History** | Local browser conversation archive with keyword search, JSON export, and resume | Local Storage |
| 18 | **Settings** | Model info, creativity slider, auto-save toggle, and server setup status | Local / Server |
| 19 | **Help and About** | Documentation, shortcuts, FAQ, and the 🇧🇩 API setup instructions | System |

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (version 20 or higher recommended)
- npm or yarn

### Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add your Gemini API key:
   - Edit `server/config.ts` Line 11 (marked with 🇧🇩), OR set `GEMINI_API_KEY` in `.env`.

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide

### Deploying to Cloud Run / Docker / Render / Railway

Because Nexora AI features a secure backend proxy (`server.ts`) that protects your API keys:

1. **Build the frontend bundle:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   NODE_ENV=production npm start
   ```

3. **Environment Variables on Your Host:**
   - In your hosting control panel (e.g., Google Cloud Run, Railway, Render, Fly.io, or Heroku), add the environment variable:
     - `GEMINI_API_KEY`: Your Google Gemini API Key
     - `PORT`: `3000` (or the provider's default `$PORT`)

The server will automatically serve the compiled frontend from `dist/` and route all AI requests securely.

---

## 📢 Monetization & Advertising

Nexora AI is equipped with Google AdSense / partner-ready responsive banner slots via `src/components/AdBanner.tsx`:
- Header banner slot
- Content inline slot
- Footer banner slot

To connect live AdSense ads:
1. Obtain your publisher ID and ad slot IDs from [Google AdSense](https://adsense.google.com).
2. Insert your `<ins class="adsbygoogle" ...>` block into `src/components/AdBanner.tsx`.
3. Ad containers adhere to Google Publisher Policies: they never block inputs, send buttons, or generated content.

---

## 🛡️ Security & Privacy Architecture

- **Zero Client-Side Key Exposure**: The browser bundle never contains the Gemini API key or secret credentials.
- **Payload Limits**: Requests are validated on the backend with a 30MB limit for high-resolution images.
- **Rate Limit & Error Handlers**: Gracefully traps `RESOURCE_EXHAUSTED`, invalid keys, or network failures with human-readable error messages.
- **Local Data Isolation**: Chats are stored locally in the user's private browser session unless Firebase sync is configured.
