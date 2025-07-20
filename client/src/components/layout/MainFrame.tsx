import React from "react";
import { Navbar } from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/footer";

export default function MainFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content + Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 bg-muted">
          {children}
        </main>
        
      </div>

      {/* Footer at bottom */}
      <Footer />
    </div>
  );
}