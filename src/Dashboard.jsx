import { GoogleGenAI } from "@google/genai";
import { useState, useMemo } from "react";

export default function Dashboard() {

    const [expenses, setExpenses] = useState([]);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const [code, setCode] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [outputScreen, setOutputScreen] = useState(false);
    const [loading, setLoading] = useState(false);

    function addExpense() {
        if (!amount) return;

        setExpenses([
            ...expenses,
            {
                amount: Number(amount),
                category,
            },
        ]);

        setAmount("");
    }

    const summary = useMemo(() => {
        return expenses.reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});
    }, [expenses]);


    const totalSpent = useMemo(() => {
        return expenses.reduce((sum, e) => sum + e.amount, 0);
    }, [expenses]);

    function extractCode(response) {
        const match = response.match(/```(?:\w+)?\n?([\s\S]*?)```/);
        return match ? match[1].trim() : response.trim();
    }

    const ai = new GoogleGenAI({
        apiKey: "AIzaSyDGurDBMFmEcRI9RdYd0oBzxxLl6cjNRmE"
    });

    async function handleresponse() {
        setLoading(true);
        try {
            const res = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `You are a frontend engineer.

Generate a COMPLETE, SELF-CONTAINED interactive finance dashboard using:

- HTML
- Tailwind CSS (via CDN)
- JavaScript
- Chart.js (via CDN)

INPUT DATA:
Monthly Income: 50000
Total Expenses: {totalSpent}
Expenses By Category:
${JSON.stringify(summary, null, 2)}

REQUIREMENTS:
1. The output must be ONE complete HTML file
2. Include Tailwind CDN and Chart.js CDN
3. Dashboard layout must include:
   - Header: "AI Finance Dashboard"
   - Card 1: Total Income
   - Card 2: Total Expenses
   - Card 3: Savings (Income - Expenses)
   Charts layout:
   - First row:
     • Pie Chart (left)& height of chart should be 80 with 5 padding 
     • Bar Chart (right) & height of chart should be 80 with 5 padding 
     • Both charts must be side-by-side (50% / 50%)
     • Each chart container height: h-[400px]
     • The charts must fit inside their containers and  
dont show scrollbar 
   - Second row (main focus):
     • Left section: Line Chart (70% width)
       - Height must be BIG (h-[600px])
       line chart heihgt should be 500 with 5 padding
     • Right section: Summary Card (30% width)
       - Contains:
         - Spending summary text
         - Category distribution list with percentages
         - Highlight overspending category

4. Charts section:
   - Pie Chart: Expense distribution by category
   - Bar Chart: Expenses by category
   - Line Chart: Expense trend (use cumulative expense values derived from categories)
   Chart sizing rules:
- Each chart must be wrapped inside a fixed-height container
- In Chart.js options set:
  maintainAspectRatio: false
- Charts must NOT stretch to full page height
5. Use Chart.js ONLY (no React, no frameworks)
6. Charts must be responsive
7. Use modern dashboard UI styling (cards, shadows, spacing)
8. All charts must render automatically when the file loads
9. No placeholders — use the input data directly
10. Do NOT include explanations or comments outside the code
11. Output ONLY valid HTML code (nothing else)

`
            });

            setCode(extractCode(res.text));
            setRefreshKey((prev) => prev + 1);
            setOutputScreen(true);
            setLoading(false);
        }
        catch (error) {
            console.log(error);
        }
    }


    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">
                AI Expense Insight Dashboard
            </h1>

            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">Add Expense</h2>

                <div className="flex gap-3">
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="border p-2 rounded w-32"
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option>Food</option>
                        <option>Rent</option>
                        <option>Transport</option>
                        <option>Shopping</option>
                        <option>Others</option>
                    </select>

                    <button
                        onClick={addExpense}
                        className="bg-blue-600 text-white px-4 rounded"
                    >
                        Add
                    </button>
                </div>
            </div>


            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">Total Spent</p>
                    <p className="text-xl font-bold">₹{totalSpent}</p>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">Categories</p>
                    <p className="text-xl font-bold">
                        {Object.keys(summary).length}
                    </p>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <p className="text-gray-500 text-sm">Monthly Income</p>
                    <p className="text-xl font-bold">₹50,000</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow mb-6">
                <h2 className="font-semibold mb-3">Expense Summary</h2>

                {Object.entries(summary).map(([cat, amt]) => (
                    <div
                        key={cat}
                        className="flex justify-between border-b py-2"
                    >
                        <span>{cat}</span>
                        <span>₹{amt}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mb-4">
                <button
                    onClick={handleresponse}
                    disabled={expenses.length === 0 || loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Generating..." : "Generate AI Insights"}
                </button>
            </div>

            <div className="bg-indigo-50 p-4 rounded border border-indigo-200">
                <h2 className="font-semibold mb-2">AI Insights</h2>
                <p className="text-sm text-gray-600">
                    AI-generated financial insights will appear here after
                    sending summarized data to backend.
                </p>
            </div>
            {outputScreen && (
                <div className="h-screen">
                    <iframe key={refreshKey} srcDoc={code} className="w-full h-full bg-white text-black"></iframe>
                </div>
            )}
        </div>
    );
}
