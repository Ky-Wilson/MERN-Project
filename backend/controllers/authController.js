const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

// Register user
// exports.registerUser = async (req, res) => {
//     const {
//         fullName, email, password, profilImageUrl
//     } = req.body;

//     // Validation : check if all fields are filled
//     if (!fullName || !email || !password) {
//         res.status(400).json({ message: "Please fill in all fields" })
//     }

//     try {
//         // Check if user already exists
//         const userExists = await User.findOne({ email });

//         if (userExists) {
//             res.status(400).json({ message: "User already exists" })
//         }

//         // Create new user
//         const user = await User.create({
//             fullName,
//             email,
//             password,
//             profilImageUrl
//         });

//         res.status(201).json({
//             id: user._id,
//             user,
//             token: generateToken(user._id)
//         });
//     }
//     catch (error) {
//         res.status(500).json({ message: "Error registering user", error: error.message })
//     }
// }
exports.registerUser = async (req, res) => {
    const { fullName, email, password, profilImageUrl } = req.body;

    // === VALIDATION ===
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "Please fill in all required fields" });
    }

    try {
        // === CHECK IF USER EXISTS ===
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // === CREATE USER ===
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl: profilImageUrl || null
        });

        // === SUCCESS RESPONSE (ONLY ONE!) ===
        return res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            message: "Error registering user", 
            error: error.message 
        });
    }
};

// Login user
exports.loginUser = async (req, res) => {

}

// Get user by ID
exports.getUserInfo = async (req, res) => {

}