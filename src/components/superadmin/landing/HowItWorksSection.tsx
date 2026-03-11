import { UserPlus, Users, Mail, ClipboardCheck, FileText } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const steps = [
  {
    icon: UserPlus,
    number: "1",
    title: "Company Signs Up",
    description: "Quick onboarding with no software installation required.",
  },
  {
    icon: Users,
    number: "2",
    title: "Employees Added",
    description: "Simply share employee email addresses with us.",
  },
  {
    icon: Mail,
    number: "3",
    title: "Weekly Micro-Lesson",
    description: "Short, practical email delivered every week.",
  },
  {
    icon: ClipboardCheck,
    number: "4",
    title: "Short Quiz",
    description: "Quick quiz reinforces the learning.",
  },
  {
    icon: FileText,
    number: "5",
    title: "Monthly Report",
    description: "Management receives progress and engagement reports.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="section-padding bg-secondary">
      <div className="section-container">
        <AnimatedSection className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple 5-step process to protect your organization.
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-foreground mb-4">
                    <step.icon className="w-6 h-6 text-foreground" strokeWidth={1.5} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
