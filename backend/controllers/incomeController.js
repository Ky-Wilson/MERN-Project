const User = require("../models/User");
const Income = require("../models/Income");

// Add income source
exports.addIncome = async (req, res) => {
    console.log("=== [addIncome] req.user:", req.user?.email);

    if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const { icon, source, amount, date } = req.body;

    if (!icon || !source || !amount || !date) {
        return res.status(400).json({ 
            success: false,
            message: "Tous les champs sont requis : icon, source, amount, date" 
        });
    }

    try {
        const income = await Income.create({
            userId: req.user._id,
            icon,
            source,
            amount: parseFloat(amount),
            date: new Date(date)
        });

        // Récupère l'utilisateur pour afficher son nom/email
        const populatedIncome = await Income.findById(income._id)
            .populate("userId", "fullName email");

        // Format date en français (Côte d'Ivoire)
        const formatDate = (d) => {
            return new Date(d).toLocaleDateString("fr-CI", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        };

        res.status(201).json({
            success: true,
            message: "Revenu ajouté avec succès",
            data: {
                id: income._id,
                icon: income.icon,
                source: income.source,
                amount: income.amount,
                date: formatDate(income.date),
                addedAt: formatDate(income.createdAt),
                user: {
                    id: req.user._id,
                    name: populatedIncome.userId?.fullName || "Inconnu",
                    email: populatedIncome.userId?.email
                }
            }
        });

    } catch (error) {
        console.error("Erreur addIncome:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'ajout",
            error: error.message
        });
    }
};

// GET ALL INCOMES
exports.getAllIncome = async (req, res) => {
    try {
        console.log("=== [getAllIncome] userId:", req.user._id);

        const incomes = await Income.find({ userId: req.user._id })
            .sort({ date: -1 })  // ← Tri décroissant par date
            .select("-__v");     // ← Optionnel : retire __v

        console.log(`Revenus trouvés: ${incomes.length}`);

        res.status(200).json({
            success: true,
            count: incomes.length,
            data: incomes.map(inc => ({
                id: inc._id,
                icon: inc.icon,
                source: inc.source,
                amount: inc.amount,
                date: inc.date.toLocaleDateString("fr-CI"),
                addedAt: inc.createdAt.toLocaleDateString("fr-CI", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            }))
        });

    } catch (error) {
        console.error("Erreur getAllIncome:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

// delete income
exports.deleteIncome = async (req, res) => {
    try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Revenu supprimé avec succès"
        })
    }
    catch(error){
        console.error("Erreur deleteIncome:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}

// download income excel
exports.downloadIncomeExcel = async (req, res) => {

}