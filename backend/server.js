require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("./config/db");

// Middleware to handle cors
app.use(cors(
    {
        origin: process.env.CLIENT_URL || "*",
        methods : ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    }
));

app.use(express.json());

// Connect to MongoDB

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
