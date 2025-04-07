
import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/Navigation";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ResultsPage from "@/pages/ResultsPage";
import HistoryPage from "@/pages/HistoryPage";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="viral-analytics-theme">
      <BrowserRouter>
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/results/:id" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
