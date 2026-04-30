const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdf = require("pdf-parse");

const app = express();
app.use(cors());
app.use(express.json());

// upload setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// PDF extract function
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
};

// ✅ FREE AI LOGIC (no API)
const getAIAnalysis = (resumeText, jobDescription) => {
  const resumeWords = resumeText.toLowerCase().split(/\W+/);
  const jdWords = jobDescription.toLowerCase().split(/\W+/);

  const matched = jdWords.filter(word => resumeWords.includes(word));

  const uniqueMatched = [...new Set(matched)];
  const uniqueJD = [...new Set(jdWords)];

  const matchPercentage = uniqueJD.length
    ? ((uniqueMatched.length / uniqueJD.length) * 100).toFixed(0)
    : 0;

  const missingSkills = uniqueJD.filter(word => !uniqueMatched.includes(word));

  return {
    matchPercentage: matchPercentage + "%",
    matchedSkills: uniqueMatched.slice(0, 5),
    missingSkills: missingSkills.slice(0, 5),
    summary: "Basic keyword-based analysis (free version)"
  };
};

// API
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jd;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;
    const resumeText = await extractTextFromPDF(filePath);

    // ✅ use FREE function
    const result = getAIAnalysis(resumeText, jobDescription);

    res.json({
      message: "AI analysis completed",
      result: result
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});