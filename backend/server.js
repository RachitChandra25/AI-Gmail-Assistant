import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import yaml from "js-yaml";
import multer from "multer";
import { initExtractor, addDocumentChunks, clearKnowledgeBase, searchSimilar, getDocuments, deleteDocument } from "./vectorStore.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");

dotenv.config();

// ✅ Load YAML config
const config = yaml.load(fs.readFileSync("./config.yaml", "utf8"));

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({ storage: multer.memoryStorage() });

// Initialize the local embedding model at startup
initExtractor().catch(console.error);

app.post("/summarize", async (req, res) => {
  try {
    const email = req.body.email;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${config.prompts.summarize}\n${email}`,
        },
      ],
      model: config.groq.model, // ✅ from YAML
    });

    const summary = completion.choices[0].message.content;

    res.json({ summary });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "AI failed" });
  }
});

app.post("/translate", async (req, res) => {
  try {
    const email = req.body.email;
    const language = req.body.language;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional translator.",
        },
        {
          role: "user",
          content: `Translate the following email into ${language}.
Return ONLY the translated text in ${language} script.
Do not explain anything.

EMAIL:
${email}`,
        },
      ],
      model: config.groq.model, // ✅ from YAML
    });

    const translation = completion.choices[0].message.content;

    res.json({ translation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Translation failed" });
  }
});

app.post("/reply", async (req, res) => {
  try {
    const email = req.body.email;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${config.prompts.reply}\n${email}`,
        },
      ],
      model: config.groq.model, // ✅ from YAML
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Reply generation failed" });
  }
});

app.post("/api/kb/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    
    // Check threshold
    const docs = getDocuments();
    if (docs.length >= 5) {
      return res.status(400).json({ error: "Threshold reached. Please delete a file to upload a new one." });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    await parser.destroy();
    const text = pdfData.text;
    
    // Chunk the text into roughly 500 character chunks (basic chunking)
    const chunks = text.match(/[\s\S]{1,500}/g) || [];
    
    // Pass the original filename
    const docId = await addDocumentChunks(chunks, req.file.originalname);
    res.json({ message: "Knowledge base updated successfully", docId, chunks: chunks.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process document" });
  }
});

app.get("/api/kb/documents", (req, res) => {
  res.json({ documents: getDocuments() });
});

app.delete("/api/kb/documents/:id", (req, res) => {
  deleteDocument(req.params.id);
  res.json({ message: "Document deleted" });
});

app.delete("/api/kb/clear", (req, res) => {
  clearKnowledgeBase();
  res.json({ message: "Knowledge base cleared" });
});

app.post("/reply-with-kb", async (req, res) => {
  try {
    const email = req.body.email;
    
    // Retrieve context from KB
    const relevantChunks = await searchSimilar(email, 3);
    const contextText = relevantChunks.join("\n\n");
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful email assistant. Use the provided knowledge base facts to answer the user's email accurately.",
        },
        {
          role: "user",
          content: `KNOWLEDGE BASE FACTS:\n${contextText}\n\nEMAIL TO REPLY TO:\n${email}\n\nDraft a polite, professional reply.`,
        },
      ],
      model: config.groq.model, // ✅ from YAML
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Reply generation failed" });
  }
});

// ✅ Use port from YAML
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
