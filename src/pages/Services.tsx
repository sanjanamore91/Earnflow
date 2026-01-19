import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Wallet, 
  BookOpen, 
  LineChart, 
  Users, 
  Headphones,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: BarChart3,
    title: "Investment Analytics",
    description: "AI-powered insights and real-time analytics to help you make informed investment decisions.",
    features: ["Real-time market data", "AI predictions", "Risk assessment", "Portfolio tracking"],
  },
  {
    icon: Wallet,
    title: "Income Optimization",
    description: "Smart tools to maximize your earnings from multiple income streams efficiently.",
    features: ["Multi-source tracking", "Tax optimization", "Expense analysis", "Savings automation"],
  },
  {
    icon: BookOpen,
    title: "Learning Academy",
    description: "Comprehensive courses and resources to master earning strategies and financial literacy.",
    features: ["Video courses", "Expert webinars", "Practice exercises", "Certifications"],
  },
  {
    icon: LineChart,
    title: "Performance Tracking",
    description: "Detailed dashboards and reports to monitor your financial growth over time.",
    features: ["Custom dashboards", "Progress reports", "Goal tracking", "Milestone alerts"],
  },
  {
    icon: Users,
    title: "Community Access",
    description: "Connect with like-minded earners, share strategies, and learn from success stories.",
    features: ["Private forums", "Networking events", "Mentor matching", "Success stories"],
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "24/7 dedicated support from our team of financial experts and advisors.",
    features: ["24/7 availability", "Personal advisor", "Quick response", "Strategy calls"],
  },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Comprehensive solutions designed to accelerate your earning journey 
              and help you achieve financial freedom.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
              >
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Choose a plan that fits your needs and start your earning journey today.
            </p>
            <Link to="/pricing">
              <Button size="lg" variant="secondary">
                View Pricing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
