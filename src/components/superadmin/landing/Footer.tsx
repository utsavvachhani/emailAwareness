import { Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-md border border-foreground">
                <Mail className="w-4 h-4 text-foreground" strokeWidth={1.5} />
              </div>
              <span className="font-semibold text-foreground">Email Awareness</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Helping Indian businesses protect their employees from email and WhatsApp fraud through simple weekly training.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" strokeWidth={1.5} />
                <a href="mailto:contact@emailawareness.in" className="hover:text-foreground transition-colors">
                  contact@emailawareness.in
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" strokeWidth={1.5} />
                <a href="tel:+919876543210" className="hover:text-foreground transition-colors">
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
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
