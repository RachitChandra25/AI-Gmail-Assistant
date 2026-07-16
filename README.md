# AI Gmail Assistant

An AI-powered Chrome Extension that enhances Gmail by allowing users to **summarize emails, translate emails, generate AI replies, and listen to summaries** directly inside the Gmail interface.

This extension integrates AI capabilities into Gmail to improve productivity and help users quickly understand and respond to emails.

---

## Features

### Email Summarization

Generate a concise summary of any email to quickly understand its key points.

### Email Translation

Translate emails into multiple languages:

- English
- Hindi
- Kannada
- Tamil
- Telugu
- Malayalam
- Marathi
- Bengali
- Punjabi

### AI Reply Generation

Automatically generate a contextual reply for the email.

### Insert Reply into Gmail

Insert the AI-generated reply directly into the Gmail compose box.

### Regenerate Reply

Generate alternative responses with one click.

### Listen to Summary

Convert the generated summary into speech using the browser's text-to-speech API.

### Copy Response

Quickly copy summaries, translations, or replies.

### Smart Toolbar

The AI toolbar only appears when an email is opened, keeping the Gmail interface clean.

---

## Tech Stack

**Frontend**

- JavaScript
- HTML
- CSS

**Backend**

- Node.js
- Express

**AI**

- Groq API (LLM)

**Browser APIs**

- Chrome Extension (Manifest V3)
- SpeechSynthesis API

---

## Project Structure

```
ai-gmail-assistant
│
├── backend
│   └── server.js
│
├── extension
│   ├── manifest.json
│   ├── content.js
│   ├── ui.js
│   ├── styles.css
│
└── README.md
```

---

## Installation

### 1. Clone the Repository

```
git clone https://github.com/yourusername/ai-gmail-assistant.git
cd ai-gmail-assistant
```

---

### 2. Configure Environment Variables

Navigate to the backend directory and set up your environment files:
```bash
cd backend
cp .env.example .env
cp config.example.yaml config.yaml
```
Open `.env` and add your GROQ API key:
```env
GROQ_API_KEY=your_api_key_here
```

---

### 3. Start the Backend Server

```bash
npm install
node server.js
```

The server will run on:

```
http://localhost:5000
```

---

### 4. Load the Chrome Extension

1. Open **Chrome**
2. Go to **chrome://extensions/**
3. Enable **Developer Mode**
4. Click **Load Unpacked**
5. Select the `extension` folder

---

### 5. Open Gmail

```
https://mail.google.com
```

Open any email to see the **AI Toolbar**.

---

## Usage

1. Open an email in Gmail
2. Use the AI toolbar to:
   - Summarize the email
   - Translate the email
   - Generate a reply

3. Insert the reply directly into Gmail
4. Listen to the summary if needed

---

## Demo

Example workflow:

1. Open Gmail email
2. Click **Summarize**
3. Click **Translate** to change language
4. Click **Reply** to generate AI response
5. Click **Insert into Gmail**

---

## Future Improvements

- Gmail theme detection
- Dark mode support
- Smart reply suggestions
- Email sentiment detection
- AI email drafting

---

## Author

Rachit Chandra
Computer Science Student
BMS College of Engineering
