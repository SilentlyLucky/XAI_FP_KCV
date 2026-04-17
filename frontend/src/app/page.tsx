"use client";

import Link from "next/link";
import Header from "@/components/Header";

export default function DocumentationPage() {
  const workflowContent = (
    <div className="flex flex-row items-stretch justify-start gap-6 pr-12 py-6">
      <div className="shrink-0 flex items-center group">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-slate-800 p-6 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:border-blue-300 transition-all duration-300 flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-500 transition-colors text-3xl">database</span>
          <span className="font-black text-sm tracking-widest uppercase text-center leading-tight">CODA<br />Dataset</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center text-blue-400">
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex flex-col justify-center relative group">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-center text-[10px] font-bold text-blue-700 uppercase tracking-widest shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-100 whitespace-nowrap">Visual Perception</div>
        <div className="border border-blue-100 bg-blue-50/50 p-6 rounded-[2rem] shadow-inner transition-colors group-hover:bg-blue-50">
          <div className="bg-white px-8 py-5 rounded-2xl shadow-md border border-white group-hover:border-blue-200 font-bold text-slate-800 flex flex-col items-center gap-2 transition-all">
            <span className="material-symbols-outlined text-blue-500">search</span>
            YOLOv11s
          </div>
        </div>
      </div>

      <div className="shrink-0 flex flex-col items-center justify-center text-blue-400 gap-2 px-2">
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase whitespace-nowrap">BBox Extract</span>
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex flex-col justify-center relative group">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-center text-[10px] font-bold text-indigo-700 uppercase tracking-widest shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-indigo-100 whitespace-nowrap">XAI Extraction</div>
        <div className="border border-indigo-100 bg-indigo-50/50 p-6 rounded-[2rem] shadow-inner flex flex-col gap-4 transition-colors group-hover:bg-indigo-50">
          <div className="bg-white px-8 py-4 rounded-2xl shadow-md border border-white group-hover:border-indigo-200 font-bold text-sm text-slate-800 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">visibility</span>
            EigenCAM
          </div>
          <div className="bg-white px-8 py-4 rounded-2xl shadow-md border border-white group-hover:border-indigo-200 font-bold text-sm text-slate-800 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">analytics</span>
            12 Metrics
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center text-indigo-400 px-2">
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex flex-col justify-center relative group">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-sky-50 border border-sky-200 rounded-full text-center text-[10px] font-bold text-sky-700 uppercase tracking-widest shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-sky-100 whitespace-nowrap">Distillation</div>
        <div className="border border-sky-100 bg-sky-50/50 p-6 rounded-[2rem] shadow-inner flex flex-col items-center gap-3 transition-colors group-hover:bg-sky-50">
          <div className="bg-white px-6 py-3 rounded-xl shadow-md border border-white group-hover:border-sky-200 font-bold text-sm text-slate-800 w-44 text-center">
            4-Tier Prompt
          </div>
          <div className="w-1 h-3 border-l-2 border-dashed border-sky-300"></div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-md border border-white group-hover:border-sky-200 font-bold text-sm text-slate-800 w-44 text-center flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sky-500 text-lg">smart_toy</span>
            Gemini 2.5 Flash
          </div>
          <div className="w-1 h-3 border-l-2 border-dashed border-sky-300"></div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-md border border-white group-hover:border-sky-200 font-bold text-sm text-slate-800 w-44 text-center">
            JSONL Output
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center text-sky-400 px-2">
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex flex-col justify-center relative group">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-center text-[10px] font-bold text-emerald-700 uppercase tracking-widest shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-emerald-100 whitespace-nowrap">VLM Fine-Tuning</div>
        <div className="border border-emerald-100 bg-emerald-50/50 p-6 rounded-[2rem] shadow-inner flex flex-row items-center gap-8 transition-colors group-hover:bg-emerald-50">
          <div className="bg-white px-6 py-6 rounded-2xl shadow-md border border-white group-hover:border-emerald-200 font-bold text-sm text-slate-800 flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500">layers</span>
            Qwen2-VL 2B
          </div>

          <div className="flex flex-col gap-6 relative">
            <div className="absolute top-1/2 -translate-y-1/2 left-8 w-8 border-t-2 border-emerald-300"></div>
            <div className="absolute top-[25%] bottom-[25%] left-8 border-l-2 border-emerald-300"></div>
            <div className="absolute top-[25%] left-8 w-8 border-t-2 border-emerald-300"></div>
            <div className="absolute bottom-[25%] left-8 w-8 border-t-2 border-emerald-300"></div>

            <div className="bg-white px-8 py-4 rounded-xl shadow-md border border-white group-hover:border-emerald-200 font-bold text-sm text-slate-800 w-32 text-center relative">
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-100"></div>
              QLoRA
            </div>
            <div className="bg-white px-8 py-4 rounded-xl shadow-md border border-white group-hover:border-emerald-200 font-bold text-sm text-slate-800 w-32 text-center relative">
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-emerald-500 rounded-full border-4 border-emerald-100"></div>
              QDoRA
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center text-emerald-400 px-2">
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex flex-col justify-center relative group">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-center text-[10px] font-bold text-purple-700 uppercase tracking-widest shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-purple-100 whitespace-nowrap">Evaluation</div>
        <div className="border border-purple-100 bg-purple-50/50 p-6 rounded-[2rem] shadow-inner h-full flex items-center transition-colors group-hover:bg-purple-50">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-md border border-white group-hover:border-purple-200 font-bold text-sm text-slate-800 text-center flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-purple-500">troubleshoot</span>
            Diagnostic<br />Evaluation
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center text-purple-400 px-2">
        <span className="material-symbols-outlined opacity-50 text-3xl">arrow_right_alt</span>
      </div>

      <div className="shrink-0 flex items-center group">
        <div className="bg-slate-900 border border-slate-700 text-white p-8 rounded-[2rem] shadow-2xl group-hover:shadow-[0_0_30px_rgba(15,23,42,0.5)] transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-slate-700/50 blur-xl rounded-full"></div>
          <span className="material-symbols-outlined text-slate-300 z-10 text-4xl">monitoring</span>
          <span className="font-black text-sm tracking-widest uppercase text-center leading-tight z-10">ROUGE/BLEU<br />Scores</span>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-center pl-6">
        <div className="flex flex-col items-center gap-3 opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
          <div className="w-1 h-30 border-l-2 border-dashed border-slate-400"></div>
          <span className="material-symbols-outlined text-slate-300 z-10 text-4xl">END</span>
          <div className="w-1 h-30 border-l-2 border-dashed border-slate-400"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
        </div>
      </div>
    </div>
  );

  return (

    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden relative selection:bg-blue-200">
      <Header stats={null} isLoading={false} onGenerate={() => { }} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-mesh">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-indigo-300/20 rounded-full blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-[30%] right-[10%] w-[600px] h-[600px] bg-violet-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[700px] h-[700px] bg-sky-200/30 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      <main className="pt-8">
        <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 text-center relative mt-8 lg:mt-0 animate-[fadeIn_1s_ease-out]">
          <div className="max-w-[1000px] relative z-10 px-4">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 mb-8 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow duration-300 cursor-default group">
              <span className="material-symbols-outlined text-blue-600 group-hover:text-amber-400 transition-colors duration-300 text-lg">auto_awesome</span>
              <span className="font-headline text-xs font-bold uppercase tracking-widest text-slate-700">Autonomous Vehicle Safety Platform</span>
            </div>

            <h1 className="font-headline text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-tighter leading-[1.05] mb-8 text-slate-800 drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 pb-2 drop-shadow-md relative">
                Visionguard
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-400/20 blur-md rounded-full"></div>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-[800px] mx-auto mb-14 leading-relaxed font-medium">
              Unmasking perception failures in autonomous detection models using <span className="text-blue-700 font-extrabold relative inline-block">Explainable AI</span> and advanced <span className="text-sky-600 font-extrabold relative inline-block">Vision Large Models (VLM)</span>.
            </p>

            <div className="flex justify-center hover:scale-105 active:scale-95 transition-transform duration-300">
              <Link href="/generator">
                <button className="relative overflow-hidden bg-gradient-to-r from-primary via-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-headline font-black text-xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_60px_rgba(0,123,255,0.4)] border border-blue-400/50 group cursor-pointer">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                  <span className="relative z-10 tracking-wide">Launch Analysis</span>
                  <span className="material-symbols-outlined relative z-10 group-hover:translate-x-2 transition-transform duration-500">arrow_forward</span>
                </button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 relative z-10 px-6">
          <div className="max-w-[1100px] mx-auto bg-gradient-to-br from-[#f6f9fc] to-[#eef2f8] rounded-[2.5rem] p-10 md:p-14 lg:p-16 shadow-[0_15px_50px_rgba(30,58,138,0.05)] border border-white relative overflow-hidden">
            <div className="absolute -bottom-32 -right-20 w-[500px] h-[500px] pointer-events-none opacity-30 text-indigo-300">
              <svg viewBox="0 0 200 200" className="w-full h-full text-current">
                <path d="M50 100 L100 50 L150 100 L100 150 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M100 50 L100 150 M50 100 L150 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                <path d="M50 100 L20 60 M150 100 L180 60 M100 150 L180 180 M100 150 L20 180" stroke="currentColor" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="4" fill="currentColor" />
                <circle cx="50" cy="100" r="8" fill="#e2e8f0" opacity="0.8" />
                <circle cx="150" cy="100" r="8" fill="#e2e8f0" opacity="0.8" />
                <circle cx="100" cy="50" r="8" fill="#e2e8f0" opacity="0.8" />
                <circle cx="100" cy="150" r="8" fill="#e2e8f0" opacity="0.8" />
                <text x="100" y="112" fontSize="34" fontWeight="black" fill="currentColor" textAnchor="middle" opacity="0.4">AI</text>
              </svg>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="text-left space-y-6">
                <h2 className="font-headline text-5xl md:text-[3.4rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] leading-[1.05] tracking-tight">
                  The Autonomous<br />Black-Box Crisis
                </h2>
                <p className="text-xl text-slate-700 leading-relaxed font-medium">
                  Object detection models excel at finding obstacles but fail to provide <span className="font-extrabold text-[#1d4ed8]">explanations</span>. We do not just look at what was missed, but we also reveal the <span className="font-extrabold text-[#1d4ed8] border-b-[3px] border-[#1d4ed8] pb-0.5">visual evidence</span> behind why these critical corner cases happen.
                </p>
              </div>

              <div className="relative flex justify-center items-center w-full h-[300px]">
                <svg className="w-full h-full max-w-[450px] drop-shadow-lg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M120 150 C 180 150, 200 90, 270 90" stroke="url(#wire-grad)" strokeWidth="3" strokeDasharray="4 4" />
                  <path d="M130 160 C 190 160, 210 120, 280 120" stroke="url(#wire-grad)" strokeWidth="2" />
                  <path d="M140 170 C 220 170, 220 200, 290 200" stroke="url(#wire-grad)" strokeWidth="4" />
                  <path d="M130 180 C 190 180, 200 220, 270 220" stroke="url(#wire-grad)" strokeWidth="2" strokeDasharray="2 3" />
                  <path d="M120 190 C 180 190, 190 240, 260 240" stroke="url(#wire-grad)" strokeWidth="1" />
                  <defs>
                    <linearGradient id="wire-grad" x1="120" y1="160" x2="280" y2="160" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#312e81" />
                      <stop offset="1" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <g stroke="#334155" strokeWidth="1.5" fill="#f8fafc">
                    <path d="M30 130 L70 100 L130 130 L90 160 Z" />
                    <path d="M30 130 L30 190 L90 220 L90 160 Z" />
                    <path d="M90 160 L90 220 L150 190 L150 130 Z" />
                    <path d="M50 145 L80 125 L110 140" stroke="#94a3b8" fill="none" />
                    <path d="M50 145 L50 185" stroke="#94a3b8" fill="none" />
                    <path d="M110 140 L110 175" stroke="#94a3b8" fill="none" />
                    <path d="M50 185 L80 200 L110 175" stroke="#94a3b8" fill="none" />
                    <ellipse cx="60" cy="160" rx="15" ry="25" fill="none" stroke="#cbd5e1" strokeWidth="2" transform="rotate(-30 60 160)" />
                    <ellipse cx="120" cy="160" rx="15" ry="25" fill="none" stroke="#cbd5e1" strokeWidth="2" transform="rotate(30 120 160)" />
                  </g>
                  <rect x="270" y="60" width="90" height="70" rx="4" fill="#ecfeff" stroke="#2dd4bf" strokeWidth="2" />
                  <line x1="270" y1="80" x2="360" y2="80" stroke="#2dd4bf" strokeWidth="2" />
                  <line x1="300" y1="60" x2="300" y2="130" stroke="#2dd4bf" strokeWidth="2" />
                  <line x1="330" y1="60" x2="330" y2="130" stroke="#2dd4bf" strokeWidth="2" />
                  <circle cx="285" cy="70" r="2" fill="#0d9488" />
                  <circle cx="315" cy="70" r="2" fill="#0d9488" />
                  <circle cx="345" cy="70" r="2" fill="#0d9488" />
                  <rect x="275" y="90" width="20" height="6" fill="#99f6e4" />
                  <rect x="305" y="90" width="20" height="6" fill="#99f6e4" />
                  <rect x="335" y="110" width="20" height="6" fill="#99f6e4" />
                  <g transform="translate(260, 160)">
                    <path d="M0 20 L0 0 L20 0" stroke="#1d4ed8" strokeWidth="2" fill="none" />
                    <path d="M100 20 L100 0 L80 0" stroke="#1d4ed8" strokeWidth="2" fill="none" />
                    <path d="M0 60 L0 80 L20 80" stroke="#1d4ed8" strokeWidth="2" fill="none" />
                    <path d="M100 60 L100 80 L80 80" stroke="#1d4ed8" strokeWidth="2" fill="none" />
                    <path d="M20 40 C 20 40, 50 15, 80 40 C 50 65, 20 40, 20 40 Z" stroke="#1d4ed8" strokeWidth="2" fill="none" />
                    <circle cx="50" cy="40" r="10" fill="#1e40af" />
                    <circle cx="52" cy="38" r="3" fill="#60a5fa" />
                  </g>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section id="results" className="pt-10 pb-24 relative z-10 px-6">
          <div className="max-w-[1200px] mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 lg:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-slate-100 relative overflow-hidden">

            <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
              <h2 className="font-headline text-4xl md:text-[2.75rem] font-black text-slate-900 leading-tight tracking-tight mb-5">
                Our Result: <span className="text-blue-600">Visual Evidence</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                Through our <span className="font-bold text-slate-900">EigenCAM</span> and <span className="font-bold text-slate-900">Qwen2-VL</span> implementation, <br />we successfully visualize the model's focus during perception failures.
              </p>
            </div>

            <div className="relative w-full rounded-[1.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 mb-8 border border-slate-200/50 bg-slate-100 group">
              <img
                src="/result.jpg"
                alt="XAI Heatmap and Bounding Box Results"
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />

            </div>

            <div className="relative bg-slate-50/80 rounded-2xl p-6 md:p-10 border border-slate-200/60 shadow-inner mb-12 text-left">
              <div className="absolute -top-3 left-6 md:left-10 bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">VLM Diagnostic Report</span>
              </div>

              <div className="space-y-5 text-sm md:text-base leading-relaxed text-slate-600 mt-2 font-medium">
                <p>
                  This detection of a car, marked as a false positive (FP), presents a significant safety concern due to its <strong className="text-slate-900">HIGH risk tier</strong>. The model's attention, visualized by <strong className="text-slate-900">EigenCAM</strong>, shows a relatively broad spread across the front of the vehicle, with a focus score of <strong className="text-blue-700 bg-blue-50 px-1 rounded">5.38</strong>. However, the attention does not strongly isolate the car's features, evidenced by the low attention IoU of <strong className="text-blue-700 bg-blue-50 px-1 rounded">0.04</strong> and a pointing game score of <strong className="text-blue-700 bg-blue-50 px-1 rounded">0.0</strong>. This suggests that the model's decision is not pinpointing specific car attributes.
                </p>
                <p>
                  Further analysis reveals that the detection is heavily influenced by background cues, as indicated by the extremely high background leakage score of <strong className="text-red-600 bg-red-50 px-1 rounded">0.98</strong>. While the model assigns a confidence of <strong className="text-slate-900">0.27</strong>, this low value, coupled with the pervasive attention on the background, points to a misclassification. The detection's reliance on spurious correlations is highlighted by the spurious correlation index of <strong className="text-slate-900">0.15</strong>. The high global entropy of <strong className="text-slate-900">4.42</strong> and sparsity of <strong className="text-slate-900">0.67</strong> suggest that the model's attention is distributed across many regions rather than being concentrated on salient object features.
                </p>
                <p>
                  In this specific case, the FP detection on a car likely stems from the model being confused by a combination of the vehicle's shape and surrounding environmental elements that share some visual similarities or are positioned in proximity. The low attention concentration (<strong className="text-slate-900">0.51</strong>) further supports this, as the attention is not tightly focused on the object's core characteristics. This misinterpretation of a HIGH risk object as a false positive is a critical failure mode that requires careful investigation to prevent potential accidents in real-world autonomous driving scenarios.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white hover:bg-slate-50 transition-colors p-6 md:p-8 rounded-[1.5rem] flex items-start gap-5 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-blue-600 text-xl md:text-2xl">precision_manufacturing</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg md:text-xl mb-2">Precise Localization</h4>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    Mapping the exact pixels that trigger or inhibit detection in corner cases, providing spatial clarity to black-box outputs.
                  </p>
                </div>
              </div>

              <div className="bg-white hover:bg-slate-50 transition-colors p-6 md:p-8 rounded-[1.5rem] flex items-start gap-5 border border-slate-100 shadow-sm">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-indigo-600 text-xl md:text-2xl">visibility</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-lg md:text-xl mb-2">Explainable Bounding Boxes</h4>
                  <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                    Beyond standard coordinates, we provide the underlying structural 'why' for every object detected or omitted by the model.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        <section id="workflow" className="py-24 relative overflow-hidden">
          <div className="max-w-[1300px] mx-auto px-6 lg:px-10">
            <div className="text-center mb-16">
              <h2 className="font-headline text-5xl font-black text-slate-900 mb-6 drop-shadow-sm">Our Methodology</h2>
              <p className="text-slate-500 font-medium tracking-wide">Hover over the pipeline to pause</p>
            </div>

            <div className="w-full relative" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
              <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white p-8 md:p-10 w-full overflow-hidden">

                <div className="flex w-max animate-infinite-scroll pause-on-hover cursor-pointer">
                  {workflowContent}
                  {workflowContent}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="analysis" className="relative z-10 pt-16 pb-24 bg-slate-50/90 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <div className="inline-block mb-6 px-5 py-2 rounded-full bg-blue-50 shadow-inner text-blue-700 font-bold text-xs uppercase tracking-widest border border-blue-100">
              Metrics Breakdown
            </div>
            <h2 className="font-headline text-5xl font-black text-slate-900 mb-20 tracking-tighter drop-shadow-sm">
              Performance Analysis
            </h2>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto text-left">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] transition-shadow duration-500 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400"></div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                <h3 className="text-3xl font-black text-slate-800 font-headline mb-10 tracking-tight flex items-center gap-3">
                  <span className="material-symbols-outlined text-indigo-500 text-3xl">database</span>
                  QLoRA Performance
                </h3>

                <div className="w-full space-y-7">
                  {[
                    { label: "ROUGE-1", score: "0.5557", width: "55.57%" },
                    { label: "ROUGE-2", score: "0.2560", width: "25.60%" },
                    { label: "ROUGE-L", score: "0.2933", width: "29.33%" },
                    { label: "BLEU", score: "0.1473", width: "14.73%" },
                    { label: "BERTScore F1", score: "0.8853", width: "88.53%" },
                  ].map((metric) => (
                    <div key={metric.label} className="group/bar relative">
                      <div className="flex justify-between text-sm font-extrabold text-slate-500 mb-2">
                        <span>{metric.label}</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2 rounded shadow-sm border border-indigo-100">{metric.score}</span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-indigo-500 rounded-full relative overflow-hidden group-hover/bar:bg-indigo-400 transition-colors duration-300"
                          style={{ width: metric.width }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(99,102,241,0.08)] border border-indigo-50 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] transition-shadow duration-500 relative overflow-hidden group hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400"></div>
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-50 rounded-full blur-2xl opacity-40 pointer-events-none group-hover:opacity-60 transition-opacity duration-500"></div>

                <h3 className="text-3xl font-black text-slate-800 font-headline mb-10 tracking-tight flex items-center gap-3 relative z-10">
                  <span className="material-symbols-outlined text-indigo-500 text-3xl">memory</span>
                  QDoRA Performance
                </h3>

                <div className="w-full space-y-7 relative z-10">
                  {[
                    { label: "ROUGE-1", score: "0.5866", width: "58.66%" },
                    { label: "ROUGE-2", score: "0.2832", width: "28.32%" },
                    { label: "ROUGE-L", score: "0.3072", width: "30.72%" },
                    { label: "BLEU", score: "0.1609", width: "16.09%" },
                    { label: "BERTScore F1", score: "0.8867", width: "88.67%" },
                  ].map((metric) => (
                    <div key={metric.label} className="relative metric-row">
                      <div className="flex justify-between text-sm font-extrabold text-slate-500 mb-2">
                        <span>{metric.label}</span>
                        <span className="text-indigo-700 bg-indigo-100 px-2 rounded font-black shadow-sm border border-indigo-200">{metric.score}</span>
                      </div>

                      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner p-[1.5px]">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 rounded-full relative overflow-hidden transition-all duration-500 shadow-[0_0_12px_rgba(99,102,241,0.6)] bg-flow animate-gradient-flow"
                          style={{ width: metric.width }}
                        >
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full shimmer-layer"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="text-center relative z-10 py-32">
          <div>
            <div className="inline-block mb-4 px-5 py-2 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs uppercase tracking-widest border border-indigo-100 shadow-sm">The Innovators</div>
            <h2 className="text-5xl font-black font-headline tracking-tighter mb-20 text-slate-900 drop-shadow-sm">Meet the Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto text-left px-8">
              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-all duration-500 group">
                <div className="w-full aspect-[4/3] rounded-[1.5rem] bg-slate-100 mb-8 overflow-hidden border-4 border-white shadow-md relative">
                  <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img src="https://ui-avatars.com/api/?name=Henry+Alifian&background=1E3B8A&color=fff&size=400&bold=true" alt="Henry Alifian" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="text-2xl font-black font-headline text-slate-800 mb-5 tracking-tight group-hover:text-blue-700 transition-colors">Henry Alifian</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">Dataset Generation</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">Fine Tuning</span>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">Web Development</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-all duration-500 group">
                <div className="w-full aspect-[4/3] rounded-[1.5rem] bg-slate-100 mb-8 overflow-hidden border-4 border-white shadow-md relative">
                  <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img src="https://ui-avatars.com/api/?name=Steven+Alvin&background=3B82F6&color=fff&size=400&bold=true" alt="Steven Alvin Christian" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="text-2xl font-black font-headline text-slate-800 mb-5 tracking-tight group-hover:text-blue-500 transition-colors">Steven Alvin Christian</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">Fine Tuning</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">Web Development</span>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_10px_40px_rgb(0,0,0,0.04)] hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all duration-500 group">
                <div className="w-full aspect-[4/3] rounded-[1.5rem] bg-slate-100 mb-8 overflow-hidden border-4 border-white shadow-md relative">
                  <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
                  <img src="https://ui-avatars.com/api/?name=Kayla+Riza&background=10B981&color=fff&size=400&bold=true" alt="Kayla Riza Putri Irjayanto" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h4 className="text-2xl font-black font-headline text-slate-800 mb-5 tracking-tight group-hover:text-emerald-600 transition-colors">Kayla Riza Putri Irjayanto</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">Dataset Preparation</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm">YOLO Implementation</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 w-full relative z- mt-auto overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
        <div className="w-full px-8 py-10 text-center text-slate-400 text-sm font-medium uppercase tracking-widest flex flex-col items-center justify-center gap-2">
          <span><b className="text-white font-bold">© 2026 Visionguard.</b> All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
