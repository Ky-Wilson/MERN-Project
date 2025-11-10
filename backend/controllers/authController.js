const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}


// controllers/authController.js
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body; // ← CORRIGÉ !

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl: profileImageUrl || null // ← maintenant ça marche
        });

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering user", error: err.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }

    try {
        // === CHECK IF USER EXISTS ===
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // === CHECK IF PASSWORD IS CORRECT ===
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // === SUCCESS RESPONSE (ONLY ONE!) ===
        return res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id)
        })
    }
    catch (err) {
        res
        .status(500)
        .json({ message: "Error logging in user", error: err.message });
    }
}

// Get user by ID
exports.getUserInfo = async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        return res.status(200).json(user);
    }
    catch (err) {
        res
        .status(500)
        .json({ message: "Error getting user info", error: err.message });
    }
}