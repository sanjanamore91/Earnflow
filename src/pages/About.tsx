import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Heart, Lightbulb, Award } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "We exist to democratize financial success and make earning opportunities accessible to everyone.",
  },
  {
    icon: Heart,
    title: "User-First",
    description: "Every decision we make starts with our users. Their success is our success.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We constantly push boundaries to bring you the latest earning strategies and tools.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We hold ourselves to the highest standards in everything we do.",
  },
];

const team = [
  { name: "Alex Rivera", role: "CEO & Founder", initials: "AR" },
  { name: "Jordan Kim", role: "CTO", initials: "JK" },
  { name: "Sam Wilson", role: "Head of Growth", initials: "SW" },
  { name: "Taylor Brooks", role: "Head of Support", initials: "TB" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About EarnFlow
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              We're on a mission to help everyone unlock their earning potential 
              through innovative tools and expert guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Founded in 2020, EarnFlow began with a simple observation: too many 
                talented individuals were struggling to maximize their earning potential 
                due to lack of proper tools and guidance.
              </p>
              <p>
                Our founders, coming from backgrounds in finance and technology, 
                set out to create a platform that would level the playing field. 
                Today, we've helped over 10,000 users generate more than $50 million 
                in combined earnings.
              </p>
              <p>
                We believe that with the right resources, anyone can achieve financial 
                success. That belief drives everything we do at EarnFlow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground">
              The passionate people behind EarnFlow.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="h-24 w-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{member.initials}</span>
                </div>
                <h3 className="font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
