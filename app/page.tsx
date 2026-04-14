"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function Home() {
  const [input, setInput] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setCompletion("");

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
        setCompletion(result); // update realtime saat streaming
      }

      setInput(""); // clear input setelah selesai
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };    

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col p-6 space-y-8">
        <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
          SmartSpend
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Menu</div>
          <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg font-medium">Dashboard</a>
          <a href="#" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">History</a>
          <a href="#" className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Settings</a>
        </nav>

        <div className="p-4 bg-slate-900 rounded-xl text-white text-sm">
          <p className="font-medium">Pro Plan</p>
          <p className="text-slate-400 text-xs mt-1">Unlock AI Insights</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex min-h-screen flex-col bg-slate-50 p-8 md:p-24">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Financial AI Dashboard 💸</h1>
            <p className="text-muted-foreground text-slate-500">
              Welcome back, ai-spend lover! Track your spending with the power of AI.
              {/* Ini masih static */}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Card 1: Total Spending */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Total Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Rp 1.250.000</div>
                <p className="text-xs text-green-500 mt-1">+2.5% from last month</p>
              </CardContent>
            </Card>

            {/* Card 2: AI Insights */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">AI Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-600 italic">"Kamu paling banyak belanja di kategori Kopi minggu ini."</div>
              </CardContent>
            </Card>

            {/* Card 3: Budget Left */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium uppercase tracking-wider text-blue-600">Budget Left</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">Rp 3.750.000</div>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-3">
                  <div className="bg-blue-600 h-1.5 rounded-full w-[75%]"></div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Input Section (The "AI Chat") */}
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">What did you buy today?</CardTitle>
            </CardHeader>
            
            {/* Hapus CardContent yang membungkus form */}
            <form onSubmit={handleSubmit}>
              <CardContent className="flex space-x-2">
                <Input 
                  placeholder="e.g. Tadi makan pagi bakso 18ribu..." 
                  className="flex-1 rounded-full border-slate-200 px-6 focus:ring-blue-500"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button type="submit" disabled={isLoading} className="rounded-full bg-blue-600 px-6 hover:bg-blue-700">
                  {isLoading ? "Analyzing..." : "Analyze with AI"}
                </Button>
              </CardContent>
            </form>

            {/* Untuk cek completion ada isinya atau nggk
            <div className="p-4 border-t space-y-2">
              <p className="text-xs text-slate-400">Status: {isLoading ? "Sedang Analisa..." : "Siap"}</p>
              
              {completion && completion.split("\n").filter(Boolean).map((line, i) => {
                const parts = line.split("|").map((s: string) => s.trim());
                const [kategori, nominal, nama] = parts;
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="font-semibold text-slate-800">{nama}</span>
                    <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">{kategori}</span>
                    <span className="font-bold text-blue-700">Rp {Number(nominal).toLocaleString("id-ID")}</span>
                  </div>
                );
              })}
            </div>

            4. AREA TAMPILAN HASIL (Simple & User Friendly) 
            {completion && (
              <div className="p-4 bg-red-50">
                <p className="text-black">Status: {isLoading ? "Lagi mikir..." : "Diam"}</p>
                <p className="text-blue-600 font-bold">Hasil AI: {completion}</p>
              </div>
            )} */}
            {/* Result */}
            <div className="p-4 border-t space-y-2">
              <p className="text-xs text-slate-400">Status: {isLoading ? "Sedang Analisa..." : "Siap"}</p>
              {completion && completion.split("\n").filter(Boolean).map((line, i) => {
                const [kategori, nominal, nama] = line.split("|").map((s: string) => s.trim());
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="font-semibold text-slate-800">{nama}</span>
                    <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded-full">{kategori}</span>
                    <span className="font-bold text-blue-700">Rp {Number(nominal).toLocaleString("id-ID")}</span>
                  </div>
                );
              })}
            </div>
          </Card>
     
        </div>
      </main>
    </div>
  );
}