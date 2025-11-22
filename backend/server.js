require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs"); // ← AJOUTÉ
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");



// === CRÉATION DU DOSSIER UPLOADS SI ABSENT ===
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Dossier 'uploads' créé");
}

// Middleware CORS
app.use(cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Parser JSON
app.use(express.json());

// Connexion DB
connectDB();

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);



// Servir les images uploadées
app.use("/uploads", express.static(uploadDir));
// Démarrage - ÉCOUTE SUR TOUTES LES INTERFACES
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {  // ← AJOUTEZ '0.0.0.0'
    console.log(`Server is running on port ${PORT}`);
    console.log(`Accessible localement: http://localhost:${PORT}`);
    console.log(`Accessible sur réseau: http://192.168.1.72:${PORT}`);  // ← VOTRE IP
    console.log(`Uploads disponibles sur: http://localhost:${PORT}/uploads`);
});