const User = require("../models/User");
const XLSX = require("xlsx");
const Expense = require("../models/Expense");

// Add expense
exports.addExpense = async (req, res) => {
    console.log("=== [addExpense] req.user:", req.user?.email);

    if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const { icon, category, amount, date } = req.body;

    if (!icon || !category || !amount || !date) {
        return res.status(400).json({
            success: false,
            message: "Tous les champs sont requis : icon, category, amount, date"
        });
    }

    try {
        const expense = await Expense.create({
            userId: req.user._id,
            icon,
            amount,
            category,
            date: new Date(date)
        });

        // Récupère l'utilisateur pour afficher son nom/email
        const populatedExpense = await Expense.findById(expense._id)
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
                id: expense._id,
                icon: expense.icon,
                category: expense.category,
                amount: expense.amount,
                date: formatDate(expense.date),
                addedAt: formatDate(expense.createdAt),
                user: {
                    id: req.user._id,
                    name: populatedExpense.userId?.fullName || "Inconnu",
                    email: populatedExpense.userId?.email
                }
            }
        });

    } catch (error) {
        console.error("Erreur addExpense:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur lors de l'ajout",
            error: error.message
        });
    }
};

// GET ALL INCOMES
exports.getAllExpense = async (req, res) => {
    try {
        console.log("=== [getAllExpense] userId:", req.user._id);

        const expenses = await Expense.find({ userId: req.user._id })
            .sort({ date: -1 })  // ← Tri décroissant par date
            .select("-__v");     // ← Optionnel : retire __v

        console.log(`Depenses trouvés: ${expenses.length}`);

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses.map(inc => ({
                id: inc._id,
                icon: inc.icon,
                category: inc.category,
                amount: inc.amount,
                date: inc.date.toLocaleDateString("fr-CI"),
                addedAt: inc.createdAt.toLocaleDateString("fr-CI", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            }))
        });

    } catch (error) {
        console.error("Erreur getAllExpense:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
};

// delete expense
exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            message: "Revenu supprimé avec succès"
        })
    }
    catch (error) {
        console.error("Erreur deleteExpense:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message
        });
    }
}
// download expense excel
exports.downloadExpenseExcel = async (req, res) => {
    try {
        const expense = await Expense.find({ userId: req.user._id })
            .sort({ date: -1 })
            .select("-__v");

        // Préparer les données pour Excel
        const data = expense.map((item) => ({
            Category: item.category,
            Montant: item.amount,
            Date: item.date,
        }));

        // Générer le fichier Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Expense");

        const filePath = "expense_details.xlsx";
        XLSX.writeFile(wb, filePath);

        // Télécharger le fichier
        res.download(filePath);
    } catch (error) {
        console.error("Erreur downloadExpenseExcel:", error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: error.message,
        });
    }
};
