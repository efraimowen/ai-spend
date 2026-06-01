"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SpendingChart from "@/components/SpendingChart";
import BudgetAlert from "@/components/BudgetAlert";
import TransactionList from "@/components/TransactionList";
import { Transaction } from "@/lib/supabase";

const BUDGET_LIMIT = 5_000_000;

export default function Home() {
    const [input, setInput] = useState("");
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [completion, setCompletion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [preview, setPreview] = useState<Transaction[]>([]);
    const [dbError, setDbError] = useState<string | null>(null);

    // ✅ FASE 3: Load transaksi dari Supabase saat pertama buka
    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        try {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        if (Array.isArray(data)) setTransactions(data);
        } catch (err) {
        console.error("Gagal load transaksi:", err);
        }
    }

    // Hitung total dari data real
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const budgetLeft = Math.max(0, BUDGET_LIMIT - totalExpense);
    const isOverBudget = totalExpense > BUDGET_LIMIT;

    const formatIDR = (v: number) =>
        new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(v);

    // Parse AI response streaming → preview transaksi
    function parseCompletionToPreview(text: string): Transaction[] {
        const today = new Date().toISOString().split("T")[0];
        return text
        .split("\n")
        .filter(Boolean)
        .map((line) => {
            const [kategori, nominal, nama] = line.split("|").map((s) => s.trim());
            const amount = Number(nominal);
            if (!nama || isNaN(amount)) return null;
            return {
            description: nama,
            amount,
            category: kategori || "Other",
            date: today,
            type: "expense" as const,
            };
        })
        .filter(Boolean) as Transaction[];
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setIsLoading(true);
        setCompletion("");
        setPreview([]);

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: input }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let result = "";

        while (reader) {
            const { done, value } = await reader.read();
            if (done) break;
            result += decoder.decode(value, { stream: true });
            setCompletion(result);
        }

        // ✅ FASE 3: Parse hasil AI jadi preview transaksi
        const parsed = parseCompletionToPreview(result);
        setPreview(parsed);
        setInput("");
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FASE 3: Simpan preview ke Supabase
    async function handleSave() {
        if (preview.length === 0) return;
        setIsSaving(true);
        setDbError(null);
        try {
        const res = await fetch("/api/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preview),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Gagal menyimpan");

        await fetchTransactions(); // refresh dari DB
        setPreview([]);
        setCompletion("");
        } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setDbError(msg);
        } finally {
        setIsSaving(false);
        }
    }

    // ✅ FASE 3: Hapus transaksi
    async function handleDelete(id: string) {
        const res = await fetch(`/api/transactions?id=${id}`, {
        method: "DELETE",
        });
        if (res.ok) {
            setTransactions((prev) => prev.filter((t) => t.id !== id));
        }
    }

    return (
    <div
        className={`flex min-h-screen transition-colors duration-700 ${
        isOverBudget ? "bg-red-50" : "bg-slate-50"
        }`}
    >
    {/* SIDEBAR */}
    <aside className="hidden md:flex w-64 bg-white border-r flex-col p-6 space-y-8">
        <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg" />
        SmartSpend
        </div>
        <nav className="flex-1 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Menu
            </div>
            <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg font-medium"> Dashboard </a>
            <a href="#" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"> History </a>
            <a href="#" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"> Settings </a>
        </nav>
        <div className="p-4 bg-slate-900 rounded-xl text-white text-sm">
        <p className="font-medium">Pro Plan</p>
        <p className="text-slate-400 text-xs mt-1">Unlock AI Insights</p>
        </div>
    </aside>

    {/* MAIN */}
    <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto w-full max-w-4xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold tracking-tight">
                Financial AI Dashboard 💸
            </h1>
            <p className="text-slate-500 mt-1">
                Track your spending with the power of AI.
            </p>
            </div>
            {isOverBudget && (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full animate-pulse">
                ⚠️ Over Budget!
            </span>
            )}
        </div>

        {/* ✅ FASE 3: Stats Cards — data real dari Supabase */}
        <div className="grid gap-4 md:grid-cols-3">
            <Card className={isOverBudget ? "border-red-300 bg-red-50" : ""}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">
                Total Spending
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                className={`text-2xl font-bold ${
                    isOverBudget ? "text-red-700" : "text-slate-900"
                }`}
                >
                {formatIDR(totalExpense)}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                {transactions.length} transaksi tercatat
                </p>
            </CardContent>
            </Card>

            <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">
                AI Insights
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-slate-600 italic">
                {transactions.length === 0
                    ? "Belum ada data. Mulai catat pengeluaranmu!"
                    : `Kategori terbanyak: ${
                        Object.entries(
                        transactions
                            .filter((t) => t.type === "expense")
                            .reduce(
                            (acc, t) => ({
                                ...acc,
                                [t.category]:
                                (acc[t.category] || 0) + t.amount,
                            }),
                            {} as Record<string, number>
                            )
                        ).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
                    }`}
                </div>
            </CardContent>
            </Card>

            <Card
            className={
                isOverBudget
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }
            >
            <CardHeader className="pb-2">
                <CardTitle
                className={`text-sm font-medium uppercase tracking-wider ${
                    isOverBudget ? "text-red-600" : "text-blue-600"
                }`}
                >
                Budget Left
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                className={`text-2xl font-bold ${
                    isOverBudget ? "text-red-700" : "text-blue-700"
                }`}
                >
                {formatIDR(budgetLeft)}
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-3">
                <div
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                    isOverBudget ? "bg-red-500 w-full" : "bg-blue-600"
                    }`}
                    style={
                    !isOverBudget
                        ? {
                            width: `${Math.min(
                            (totalExpense / BUDGET_LIMIT) * 100,
                            100
                            )}%`,
                        }
                        : {}
                    }
                />
                </div>
            </CardContent>
            </Card>
        </div>

        {/* ✅ FASE 3: Budget Alert */}
        <BudgetAlert transactions={transactions} />

        {/* Chat Input */}
        <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
            <CardTitle className="text-lg">What did you buy today?</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
            <CardContent className="flex space-x-2">
                <Input
                placeholder="e.g. Tadi makan bakso 18rb, parkir 3rb..."
                className="flex-1 rounded-full border-slate-200 px-6"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                />
                <Button
                type="submit"
                disabled={isLoading}
                className="rounded-full bg-blue-600 px-6 hover:bg-blue-700"
                >
                {isLoading ? "Analyzing..." : "Analyze with AI"}
                </Button>
            </CardContent>
            </form>

            {/* Hasil streaming AI */}
            {completion && (
            <div className="px-6 pb-4 border-t space-y-2 pt-4">
                <p className="text-xs text-slate-400">
                Hasil analisa AI — preview sebelum disimpan:
                </p>
                {completion
                .split("\n")
                .filter(Boolean)
                .map((line, i) => {
                    const [kategori, nominal, nama] = line
                    .split("|")
                    .map((s: string) => s.trim());
                    return (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl"
                    >
                        <span className="font-semibold text-slate-800">
                        {nama}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">
                        {kategori}
                        </span>
                        <span className="font-bold text-blue-700">
                        Rp {Number(nominal).toLocaleString("id-ID")}
                        </span>
                    </div>
                    );
                })}

                {/* ✅ FASE 3: Tombol simpan ke Supabase */}
                {preview.length > 0 && (
                <div className="flex gap-2 pt-2">
                    <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5"
                    >
                    {isSaving ? "Menyimpan..." : "💾 Simpan ke Database"}
                    </Button>
                    <Button
                    variant="outline"
                    onClick={() => {
                        setPreview([]);
                        setCompletion("");
                    }}
                    className="rounded-full px-5"
                    >
                    Batal
                    </Button>
                </div>
                )}

                {dbError && (
                <p className="text-xs text-red-500 mt-1">⚠️ {dbError}</p>
                )}
            </div>
            )}
        </Card>

        {/* ✅ FASE 3: Spending Chart */}
        <Card>
            <CardHeader>
            <CardTitle className="text-base">
                📊 Visualisasi Pengeluaran
            </CardTitle>
            </CardHeader>
            <CardContent>
            <SpendingChart transactions={transactions} />
            </CardContent>
        </Card>

        {/* ✅ FASE 3: Transaction History dari Supabase */}
        <Card>
            <CardHeader>
            <CardTitle className="text-base">📋 Riwayat Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
            <TransactionList
                transactions={transactions}
                onDelete={handleDelete}
            />
            </CardContent>
        </Card>

        </div>
    </main>
    </div>
    );
}