
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
}