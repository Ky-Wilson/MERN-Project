const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    }, // Exemple : "Alimentation", "Loisirs", "Santé", etc.
    amount: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true,
    }
},
{
    timestamps: true,
}
);
module.exports = mongoose.model("Expense", expenseSchema);