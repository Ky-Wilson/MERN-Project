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

    }  catch (err) {
        res
        .status(500)
        .json({ message: "Error registering user", error: err.message });
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