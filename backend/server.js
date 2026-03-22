import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import fs from "fs";
import yaml from "js-yaml";

dotenv.config();

// ✅ Load YAML config
const config = yaml.load(fs.readFileSync("./config.yaml", "utf8"));

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

// ✅ Use port from YAML
app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
});
