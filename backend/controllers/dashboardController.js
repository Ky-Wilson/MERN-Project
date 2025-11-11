const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { isValidObjectId } = require("mongoose");

// Dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Validation de l'ID (sécurité)
        if (!isValidObjectId(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // === 1. Total des revenus et dépenses (toutes les dates) ===
        const [totalIncomeResult, totalExpenseResult] = await Promise.all([
            Income.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            Expense.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const totalIncome = totalIncomeResult[0]?.total || 0;
        const totalExpense = totalExpenseResult[0]?.total || 0;
        const totalBalance = totalIncome - totalExpense;

        // === 2. Revenus des 60 derniers jours ===
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        const last60DaysIncomes = await Income.find({
            userId,
            date: { $gte: sixtyDaysAgo }
        }).sort({ date: -1 });

        const incomeLast60Days = last60DaysIncomes.reduce((sum, t) => sum + t.amount, 0);

        // === 3. Dépenses des 30 derniers jours ===
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const last30DaysExpenses = await Expense.find({
            userId,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        const expenseLast30Days = last30DaysExpenses.reduce((sum, t) => sum + t.amount, 0);

        // === 4. Dernières 5 transactions (revenus + dépenses) ===
        const [recentIncomes, recentExpenses] = await Promise.all([
            Income.find({ userId }).sort({ date: -1 }).limit(5).lean(),
            Expense.find({ userId }).sort({ date: -1 }).limit(5).lean()
        ]);

        const recentIncomesWithType = recentIncomes.map(t => ({ ...t, type: "income" }));
        const recentExpensesWithType = recentExpenses.map(t => ({ ...t, type: "expense" }));

        const lastTransactions = [...recentIncomesWithType, ...recentExpensesWithType]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        // === Réponse finale ===
        res.status(200).json({
            totalBalance,
            totalIncome,
            totalExpense,
            last60DaysIncome: {
                total: incomeLast60Days,
                transactions: last60DaysIncomes
            },
            last30DaysExpenses: {
                total: expenseLast30Days,
                transactions: last30DaysExpenses
            },
            recentTransactions: lastTransactions
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};