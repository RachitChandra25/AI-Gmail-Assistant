import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/summarize", async (req, res) => {
  try {
    const email = req.body.email;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Summarize this email in 3 bullet points:\n${email}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
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
      model: "llama-3.3-70b-versatile",
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
          content: `Write a short professional reply to this email:\n${email}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    const reply = completion.choices[0].message.content;

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Reply generation failed" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
