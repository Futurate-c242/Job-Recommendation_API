const tf = require("@tensorflow/tfjs-node");
const express = require("express");
const { Storage } = require("@google-cloud/storage");
const db = require("../firebaseConfig"); // Firebase configuration file
const vectorizerData = require("../vectorizer.json");
const encoderData = require("../encoder.json");

const router = express.Router();

// Konstanta untuk input shape
const inputShape = [1, 10000];

// Muat vectorizer dari vectorizer.json
const vectorizer = {
  vocabulary: vectorizerData.vocabulary,
  idf: vectorizerData.idf,
  stopWords: new Set(vectorizerData.stop_words),
};

function vectorizeText(inputText) {
  const terms = inputText.split("|").map((term) => term.trim().toLowerCase());
  if (!vectorizer.idf) {
    console.warn("IDF is missing. Using default values.");
    vectorizer.idf = Array(Object.keys(vectorizer.vocabulary).length).fill(1);
  }

  const vector = Array(Object.keys(vectorizer.vocabulary).length).fill(0);

  terms.forEach((term) => {
    if (vectorizer.vocabulary[term] !== undefined) {
      const idx = vectorizer.vocabulary[term];
      vector[idx] = vectorizer.idf[idx] !== undefined ? vectorizer.idf[idx] : 1;
    }
  });

  // Tambahkan padding untuk memastikan panjangnya sesuai dengan inputShape
  return padVector(vector, inputShape[1]);
}

// Fungsi untuk menambahkan padding atau cropping
function padVector(vector, length) {
  if (vector.length < length) {
    return [...vector, ...Array(length - vector.length).fill(0)];
  }
  return vector.slice(0, length);
}

// Muat encoder dari encoder.json
const encoder = encoderData.classes;

// Fungsi untuk merekomendasikan pekerjaan
async function recommendJobs(userSkills, model, topN = 10) {
  const userVector = vectorizeText(userSkills);
  const inputTensor = tf.tensor([userVector]).reshape(inputShape);

  try {
    const predictions = model.predict(inputTensor);
    const probabilities = await predictions.array();
    predictions.dispose();

    const topIndices = probabilities[0]
      .map((prob, idx) => ({ idx, prob }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topN)
      .map((item) => item.idx);

    const recommendedJobs = topIndices.map((idx) => encoder[idx]);
    return recommendedJobs;
  } catch (error) {
    console.error("Prediction error:", error);
    throw error;
  }
}

// Inisialisasi Google Cloud Storage
const storage = new Storage();
const bucketName = "futurate-c242-ps489.appspot.com"; // Ganti dengan nama bucket Anda
const modelFilePath = "model/model.json"; // Path file model di bucket

// Fungsi untuk memuat model langsung dari GCS
async function loadModelFromGCS() {
  const modelUrl = `https://storage.googleapis.com/${bucketName}/${modelFilePath}`;
  console.log("Loading model from:", modelUrl);
  const model = await tf.loadLayersModel(modelUrl);
  console.log("Model loaded successfully.");
  return model;
}

// Endpoint untuk merekomendasikan pekerjaan
router.post("/", async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Ambil data dari database
    const userDoc = await db.collection("user-skills").doc(userID).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userSkillsArray = userDoc
      .data()
      .user_skills.map((skill) => skill.toLowerCase());
    if (!userSkillsArray || userSkillsArray.length === 0) {
      return res.status(400).json({ error: "No skills found for the user" });
    }

    const userSkills = userSkillsArray.join("|");

    console.log("User skills:", userSkills);

    // Muat model langsung dari GCS
    const model = await loadModelFromGCS();

    // Dapatkan rekomendasi pekerjaan
    const jobs = await recommendJobs(userSkills, model);

    // Simpan rekomendasi ke Firebase
    const jobRecommendationRef = db.collection("job_recommendation").doc(userID);
    await jobRecommendationRef.set({
      userID,
      recommendedJobs: jobs,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error during recommendation:", error);
    res.status(500).json({ error: "Failed to recommend jobs" });
  }
});

module.exports = router;
