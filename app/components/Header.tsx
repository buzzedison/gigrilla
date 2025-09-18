import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logos/Gigrilla Logo-Word alongside Logo-Head Dark Pruple Cerise Clear-PNG 3556 x 1086.png"
              alt="Gigrilla Logo"
              className="h-10 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Artists
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Venues
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Gig Finder
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Charts
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Specialists
            </a>
            <a href="#" className="text-gray-600 hover:text-black transition-colors">
              Services
            </a>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <a href="/login" className="text-gray-600 hover:text-black transition-colors">
              Login
            </a>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full">
              <a href="/signup">Sign up</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}