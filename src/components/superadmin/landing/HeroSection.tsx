import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6 animate-fade-up">
            Prevent Costly Email & WhatsApp Frauds — One Lesson Per Week
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up stagger-1">
            Train employees to identify scams, phishing, fake invoices, and malware in just 2–3 minutes a week.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fade-up stagger-2">
            <Button size="lg" className="w-full sm:w-auto">
              Book Free Demo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <MessageCircle className="w-4 h-4 mr-2" />
              Talk to Us on WhatsApp
            </Button>
          </div>
          
          {/* Trust line */}
          <p className="text-sm text-muted-foreground animate-fade-up stagger-3">
            No software. No meetings. Zero disruption.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
