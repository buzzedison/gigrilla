import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Search, Shield, Zap, Users, Star, Clock } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Smart Matching",
    description: "Our AI-powered algorithm connects you with the perfect freelancers based on your project requirements and budget."
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Protected transactions with escrow services ensure your money is safe until work is completed to your satisfaction."
  },
  {
    icon: Zap,
    title: "Fast Delivery",
    description: "Get your projects completed faster with our network of pre-vetted, high-quality freelancers."
  },
  {
    icon: Users,
    title: "Global Talent Pool",
    description: "Access thousands of skilled professionals from around the world, available 24/7 to work on your projects."
  },
  {
    icon: Star,
    title: "Quality Assurance",
    description: "All freelancers are thoroughly vetted and rated by previous clients to ensure top-quality work."
  },
  {
    icon: Clock,
    title: "Real-time Collaboration",
    description: "Built-in messaging, file sharing, and project tracking tools keep you connected throughout the process."
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            Why Choose The Gigrilla?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;ve built the most powerful platform to connect businesses with freelancers, 
            making project collaboration seamless and efficient.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}