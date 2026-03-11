import { Mail, FileText, UserX, Link2, MessageSquare, Lock } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const topics = [
  {
    icon: Mail,
    title: "Scam & Phishing Emails",
    description: "Recognize fraudulent emails before clicking",
  },
  {
    icon: FileText,
    title: "Fake Invoice Fraud",
    description: "Spot fake payment requests and invoices",
  },
  {
    icon: UserX,
    title: "CEO Impersonation",
    description: "Identify fake requests from 'management'",
  },
  {
    icon: Link2,
    title: "Malware & Suspicious Links",
    description: "Avoid downloading harmful files",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp & QR Fraud",
    description: "Stay safe on messaging apps",
  },
  {
    icon: Lock,
    title: "Password & Data Protection",
    description: "Basic security hygiene practices",
  },
];

const WhatEmployeesLearnSection = () => {
  return (
    <section className="section-padding">
      <div className="section-container">
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            What Employees Learn
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical topics covering real threats faced by Indian businesses.
          </p>
        </AnimatedSection>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, index) => (
              <AnimatedSection key={index} animation="scale-in" delay={index * 80}>
                <div className="p-5 bg-secondary rounded-lg border border-border h-full">
                  <div className="flex items-center justify-center w-10 h-10 rounded-md border border-foreground mb-4">
                    <topic.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {topic.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatEmployeesLearnSection;
