# AI Gmail Assistant: Technical Documentation & Architecture

## Overview
The AI Gmail Assistant is a full-stack Chrome Extension designed to enhance email productivity. It seamlessly integrates into the Gmail interface to provide AI-powered summarization, translation, and automated replies. The project also features a custom Knowledge Base (RAG system) allowing users to upload personal documents (PDFs) to guide the AI's responses with highly accurate, user-specific facts.

---

## 1. Core Architecture: How It Connects to Chrome

A Chrome Extension acts as a bridge between the browser (Gmail) and our external logic (Backend).

### **Manifest V3 (`manifest.json`)**
The `manifest.json` is the blueprint of the extension. It tells Google Chrome everything it needs to know to run the program.
* **Implementation:** We used Manifest V3, which is the latest standard for Chrome extensions.
* **Role:** It declares our permissions (`activeTab`, `scripting`) and instructs Chrome to inject our JavaScript files (`content.js`, `ui.js`) directly into `https://mail.google.com/*`. It also configures our Options Page (`options.html`) where the user manages their Knowledge Base.

### **Content Scripts (`content.js`, `ui.js`)**
Content scripts are JavaScript files that run in the context of web pages.
* **Implementation:** Our extension uses a `MutationObserver` in `content.js` to constantly watch the Gmail webpage. Once it detects that an email is opened, it triggers `ui.js` to inject our custom HTML toolbar into the Gmail page.
* **Role:** They act as the "eyes and hands" of the extension. They extract the text of the email you are currently reading, insert the generated AI replies directly into the Gmail compose box, and handle all the button click events.

---

## 2. Button Workflows & Data Flow

When a user clicks a button on the injected toolbar, a specific flow of data occurs:

### **Summarize / Reply / Translate Flow**
1. **Trigger:** User clicks a button (e.g., "Summarize").
2. **Extraction:** `content.js` grabs the raw text of the opened email using DOM manipulation (`document.querySelector`).
3. **API Call:** The extension sends a secure HTTP `POST` request to our local Node.js backend (`http://localhost:5000/summarize`) carrying the email text.
4. **LLM Processing:** The backend receives the text, wraps it in a specific prompt ("Summarize this email..."), and sends it to the **Groq API**.
5. **Response:** Groq returns the generated text. The backend forwards this back to the Chrome Extension.
6. **UI Update:** The extension displays the result in a custom floating panel and allows the user to insert it directly into the Gmail reply box or copy it to their clipboard.

---

## 3. Technologies Used & Their Implementation

### **JavaScript (ES6+)**
* **Role:** The entire project (both Frontend and Backend) is written in JavaScript.
* **Implementation:** We used modern asynchronous JavaScript (`async/await`) to handle network requests without freezing the UI. We also used modern DOM API methods to manipulate the Gmail interface dynamically.

### **Web Speech API (Speech Synthesis)**
* **Role:** Provides Text-to-Speech (TTS) capabilities directly in the browser, completely for free.
* **Implementation:** When the user clicks the "Listen" button on a generated summary, `ui.js` passes the text to the browser's native `SpeechSynthesisUtterance` interface.
* **Process:** The text is first cleaned using Regular Expressions (RegEx) to remove formatting symbols like asterisks and hashtags so the AI voice reads it naturally. The browser then reads the summary out loud to the user without needing any external paid APIs.

### **Node.js & Express.js (Backend Server)**
* **Role:** Acts as the middleman between the Chrome Extension and external AI services.
* **Implementation:** We built a RESTful API using Express. It handles incoming requests from the extension, manages file uploads using `multer`, and processes the AI logic. This keeps our API keys secure (they are hidden in a `.env` file on the backend, rather than exposed in the Chrome Extension code).

### **Groq API (Cloud LLM)**
* **Role:** The "Brain" of the operation. Groq provides ultra-fast inference for Large Language Models (LLMs) like LLaMA 3.
* **Implementation:** We use the `groq-sdk` in our backend to send prompts and receive AI-generated text. It handles the summarization, translation, and drafting of email replies.

---

## 4. The Knowledge Base: RAG & Transformers.js

The most advanced feature of this project is the **"Reply with KB"** functionality, which relies on a technique called **Retrieval-Augmented Generation (RAG)**.

### **What is RAG?**
LLMs (like the one Groq uses) only know what they were trained on. They don't know your personal resume, your company's refund policy, or specific project details. **RAG** solves this by searching your personal documents for relevant facts *before* generating a reply, and feeding those facts to the LLM.

### **How We Implemented RAG:**
1. **Document Upload & Parsing (`pdf-parse`):** When you upload a PDF via the extension's Options page, the backend uses the `pdf-parse` library to extract all the raw text from the file.
2. **Chunking:** Large PDFs are too big for AI to process all at once. We slice the extracted text into smaller blocks (chunks) of roughly 500 characters.

### **Transformers.js (`@xenova/transformers`)**
* **Role:** To create mathematical representations (Embeddings) of text.
* **Implementation:** We run a lightweight, open-source embedding model (`Xenova/all-MiniLM-L6-v2`) directly inside our Node.js backend without needing a paid API.
* **Process:** 
  - Every time a document is chunked, Transformers.js converts each chunk into an **Embedding** (a long array of numbers that represents the *meaning* of the text).
  - We store these embeddings in our **In-Memory Vector Database** (a Javascript array tracking the document ID, the raw text, and the embedding).

### **The "Reply with KB" Workflow:**
1. **Receive Email:** The user clicks "Reply with KB". The extension sends the received email text to the backend.
2. **Embed the Query:** The backend uses Transformers.js to convert the incoming email text into an embedding.
3. **Semantic Search (Cosine Similarity):** The system mathematically compares the email's embedding against every single chunk embedding in the Vector Database to find the top 3 most relevant paragraphs (Cosine Similarity).
4. **Augmented Generation:** The backend sends a special prompt to the Groq API: *"Here is an email. Here are 3 facts from the user's Knowledge Base. Draft a reply using ONLY these facts."*
5. **Result:** The LLM generates a hyper-accurate, fact-based reply tailored specifically to the user's uploaded documents!
