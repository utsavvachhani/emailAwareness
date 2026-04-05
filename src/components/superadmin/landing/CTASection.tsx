import { ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const CTASection = () => {
  return (
    <section className="section-padding bg-foreground">
      <div className="section-container">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-background mb-4">
            Protect Your Company Before a Fraud Happens
          </h2>
          <p className="text-lg text-background/70 mb-8 max-w-xl mx-auto">
            Start building a security-aware workforce today. No software, no hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all"
            >
              <a href="#demo">
                <Calendar className="w-4 h-4 mr-2" />
                See Platform Demo
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all"
            >
              <a href="#pricing">
                <ArrowRight className="w-4 h-4 mr-2" />
                View Detailed Pricing
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-background/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all"
            >
              <a href="#contact">
                <MessageCircle className="w-4 h-4 mr-2" />
                Direct Inquiry
              </a>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;
