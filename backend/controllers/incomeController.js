const User = require("../models/User");
const Income = require("../models/Income");

// Add income source
exports.addIncome = async (req, res) => {
    const userId = req.user.id;
    try{
        const {
            icon, source, amount, date
        } = req.body;
        // Validation : check for missing fields
        if (!icon || !source || !amount || !date) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date : new Date(date)
        });

        await newIncome.save();
        res.status(200).json({ message: "Income added successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error adding income" });
    }
}

// Add income source


// get All Income
exports.getAllIncome = async (req, res) => {

}

// delete income
exports.deleteIncome = async (req, res) => {

}

// download income excel
exports.downloadIncomeExcel = async (req, res) => {

}