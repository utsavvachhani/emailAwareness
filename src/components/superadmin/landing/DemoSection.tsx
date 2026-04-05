"use client";

import { FileText, ExternalLink, Play, Presentation } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const DemoSection = () => {
    return (
        <section id="demo" className="section-padding bg-zinc-50 relative overflow-hidden">
            {/* Abstract Background */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px] -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[120px] -ml-10 -mb-10" />
            </div>

            <div className="section-container relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <AnimatedSection animation="slide-right">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] uppercase tracking-widest text-blue-600 font-black mb-6">
                            <Play className="w-3 h-3 fill-blue-600" />
                            Platform Experience
                        </div>
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-zinc-900 mb-8 tracking-tighter italic uppercase leading-[0.9]">
                            See the <br /><span className="text-blue-600">Awareness Hub</span> in Action
                        </h2>
                        <p className="text-lg text-zinc-500 max-w-xl font-medium leading-relaxed mb-10">
                            Don't just take our word for it. Download our official platform demonstration document to see how we transform enterprise security culture through micro-learning.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <a 
                                href="https://drive.google.com/file/d/1UftopJwwDzDrjoXV55kVgKe8O8VYCPHS/view?usp=sharing" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-zinc-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-zinc-900/20 group"
                            >
                                <FileText className="w-4 h-4 text-blue-400" />
                                Download Demo PDF
                                <ExternalLink className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                            </a>
                            <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                                <Presentation className="w-5 h-5 text-zinc-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">Format</p>
                                    <p className="text-xs font-bold text-zinc-900">Official Whitepaper</p>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>

                    <AnimatedSection animation="slide-left" className="relative">
                        <div className="aspect-[4/3] rounded-[3rem] bg-zinc-900 p-2 shadow-2xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-20 group-hover:opacity-40 transition-opacity" />
                           <div className="h-full w-full rounded-[2.5rem] bg-white overflow-hidden flex items-center justify-center relative">
                               {/* Mock UI or illustrative image could go here */}
                               <img 
                                 src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200" 
                                 alt="Dashboard Demo" 
                                 className="w-full h-full object-cover opacity-80"
                               />
                               <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform cursor-pointer">
                                        <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
                                    </div>
                               </div>
                           </div>
                        </div>
                        {/* Status Floaties */}
                        <div className="absolute -top-6 -right-6 p-6 bg-white rounded-[2rem] shadow-xl border border-zinc-100 animate-bounce duration-[3000ms]">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                     <Sparkles className="w-5 h-5 text-emerald-600" />
                                 </div>
                                 <div>
                                     <p className="text-[9px] font-black uppercase text-zinc-400">Security Score</p>
                                     <p className="text-sm font-black italic">+24% Increase</p>
                                 </div>
                             </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

const Sparkles = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

export default DemoSection;
