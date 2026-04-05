import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-foreground bg-foreground/5 overflow-hidden p-2">
                <img src="/logo.svg" alt="CyberShield Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black italic uppercase tracking-tighter text-foreground text-xl">CyberShield</span>
            </Link>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-xs">
              Protecting enterprise human firewalls through high-fidelity micro-learning delivered via email and WhatsApp.
              Empowering global workforces with 2-minute actionable modules.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-foreground/40 mb-6 italic">Direct Support Nodes</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-foreground/60" strokeWidth={2} />
                </div>
                <a href="mailto:vachhaniutsav2@gmail.com" className="font-bold hover:text-foreground transition-colors tracking-tight">
                  vachhaniutsav2@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-foreground/60" strokeWidth={2} />
                </div>
                <a href="tel:+919512655868" className="font-bold hover:text-foreground transition-colors tracking-tight">
                  +91 95126 55868
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-[10px] text-foreground/40 mb-6 italic">Governance Manifests</h4>
            <ul className="space-y-4 text-sm text-foreground">
              <li>
                <Link href="/privacy" className="font-black italic hover:text-foreground/40 transition-colors uppercase tracking-[0.1em]">
                  Privacy Protocol
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-black italic hover:text-foreground/40 transition-colors uppercase tracking-[0.1em]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 Email Awareness Micro Training. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
              This service provides security awareness education. We are not responsible for any losses due to cyber attacks. Always verify suspicious communications through official channels.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
