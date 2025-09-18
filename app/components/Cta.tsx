import { Button } from "./ui/button";
import { ArrowRight, Users, TrendingUp } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Join thousands of businesses who trust The Gigrilla to connect them with world-class freelancers. 
            Start your next project today and experience the difference.
          </p>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-8 py-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-80">Active Freelancers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
              <div className="text-lg opacity-80">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-80">Success Rate</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Users className="mr-2 h-5 w-5" />
              Start Hiring Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-4 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Become a Freelancer
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="pt-8 border-t border-primary-foreground/20">
            <p className="text-sm opacity-70 mb-4">
              No setup fees • Cancel anytime • 24/7 support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}