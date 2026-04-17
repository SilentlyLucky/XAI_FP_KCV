"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import type { ImageStats } from "@/lib/types";

interface HeaderProps {
  stats: ImageStats | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export default function Header({ stats, isLoading, onGenerate }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-surface-variant px-6 py-3">
      <div className="max-w-400 mx-auto flex items-center justify-between">
        
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="Visionguard Logo" width={40} height={40} className="w-10 h-10 object-contain" priority />
            <span className="text-xl font-black tracking-tighter text-primary font-headline hidden xl:block">
              Visionguard
            </span>
          </Link>
        </div>

        <div className="flex-none hidden md:flex justify-center">
          <nav className="flex items-center gap-1 bg-surface-low border border-surface-variant p-1 rounded-xl">
            <Link
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                pathname === "/" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-primary"
              }`}
              href="/"
            >
              <span className="material-symbols-outlined text-[18px]">menu_book</span>
              Documentation
            </Link>
            <Link
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                pathname === "/generator" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-primary"
              }`}
              href="/generator"
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              XAI Generator
            </Link>
          </nav>
        </div>

        <div className="flex-1 flex items-center justify-end gap-3">
          {stats && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
              <div className="flex items-center gap-1">
                <StatBadge label="TP" value={stats.tp_count} color="bg-tp/10 text-tp" tip="True Positive" />
                <StatBadge label="FP" value={stats.fp_count} color="bg-fp/10 text-fp" tip="False Positive" />
                <StatBadge label="FN" value={stats.fn_count} color="bg-fn/10 text-fn" tip="False Negative" />
              </div>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">F1</span>
                <span className="text-sm font-black text-slate-700">{stats.f1_score.toFixed(3)}</span>
              </div>
            </div>
          )}

          {pathname === "/generator" && (
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              NEW ANALYSIS
            </button>
          )}
        </div>

      </div>
    </header>
  );
}

function StatBadge({ label, value, color, tip }: { label: string; value: number; color: string; tip: string }) {
  return (
    <div className="relative group/tip flex">
      <span className={`flex items-center px-2 py-0.5 ${color} rounded-md text-[10px] font-black border border-current/10 whitespace-nowrap`}>
        {label}: {value}
      </span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[9px] rounded opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z- shadow-xl">
        {tip}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}