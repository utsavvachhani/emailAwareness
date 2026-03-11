import { AlertCircle } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const problems = [
  "Employees are the #1 target for cyber attacks",
  "Fake emails & WhatsApp scams cause financial loss",
  "One mistake can cost lakhs and damage reputation",
  "Traditional training is forgotten within weeks",
];

const ProblemSection = () => {
  return (
    <section id="problem" className="section-padding bg-secondary">
      <div className="section-container">
        <AnimatedSection className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              The Problem
            </h2>
            <p className="text-lg text-muted-foreground">
              Your employees face cyber threats every single day.
            </p>
          </div>

          <div className="space-y-4">
            {problems.map((problem, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="flex items-start gap-4 p-5 bg-background rounded-lg border border-border">
                  <div className="shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-foreground font-medium">{problem}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProblemSection;
