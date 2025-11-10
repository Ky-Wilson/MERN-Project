const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    let token;

    console.log("=== protect middleware ===");
    console.log("Authorization header:", req.headers.authorization);

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        console.log("Token extrait:", token);
    } else {
        console.log("Aucun token trouvé");
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token décodé:", decoded);

        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            console.log("Utilisateur non trouvé pour ID:", decoded.id);
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        console.log("Utilisateur attaché à req.user:", user.email);
        next();
    } catch (error) {
        console.error("Erreur JWT:", error.message);
        return res.status(401).json({ message: "Not authorized, token failed" });
    }
};