require("dotenv").config();
const express = require("express");
const db = require("./firebaseConfig"); // Import Firestore instance
const recommendationRoutes = require("./routes/recommendations");
const path = require("path");

const app = express();

// Middleware untuk parsing request body dalam format JSON
app.use(express.json());

// Middleware untuk menyimpan Firestore instance di req agar dapat digunakan di routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Definisikan route untuk rekomendasi pekerjaan
app.use("/api/recommendations", recommendationRoutes);

// Path global untuk akses file model
global.__basedir = path.resolve(__dirname);

// Jalankan server pada port yang ditentukan
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
