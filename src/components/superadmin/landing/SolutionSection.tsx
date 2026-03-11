import { Mail, BookOpen, Users, RefreshCw } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: Mail,
    title: "1 short email lesson every week",
  },
  {
    icon: BookOpen,
    title: "Real scam examples employees can relate to",
  },
  {
    icon: Users,
    title: "Easy language for non-technical staff",
  },
  {
    icon: RefreshCw,
    title: "Continuous learning instead of one-time training",
  },
];

const SolutionSection = () => {
  return (
    <section className="section-padding">
      <div className="section-container">
        <AnimatedSection className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Our Solution
          </p>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simple Weekly Email Awareness Training
          </h2>
          <p className="text-lg text-muted-foreground">
            Practical security lessons that fit into any workday.
          </p>
        </AnimatedSection>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <AnimatedSection key={index} animation="scale-in" delay={index * 100}>
                <div className="flex items-center gap-4 p-5 bg-secondary rounded-lg border border-border">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-md border border-foreground">
                    <feature.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <p className="text-foreground font-medium text-sm">{feature.title}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
