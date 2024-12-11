const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBIOA4EzLWRXvyDfAvMcN8Im4xGyi9Xueg",
  authDomain: "futurate-c242-ps489.firebaseapp.com",
  projectId: "futurate-c242-ps489",
  storageBucket: "futurate-c242-ps489.firebasestorage.app",
  messagingSenderId: "352594405825",
  appId: "1:352594405825:web:2d0c36fd3e222917df2740"
};

// Inisialisasi Firebase hanya jika belum diinisialisasi
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Ekspor Firestore instance
const db = firebase.firestore();
module.exports = db;
