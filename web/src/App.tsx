import React from "react";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const navigate = useNavigate();

  const navLinks = [
    { name: "Pricing", path: "#" },
    { name: "Community", path: "#" },
    { name: "Blog", path: "#" },
    { name: "Careers", path: "#" },
    { name: "Guide", path: "#" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-purple-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-serif font-semibold tracking-tight">Algobase</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.path}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <button
          onClick={() => navigate("/signin")}
          className="px-4 py-2 text-sm font-medium border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all"
        >
          Get started free
        </button>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Illustration Container */}
          <div className="mb-12 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <img
                src="/cube.png"
                alt="Algobase Hero Illustration"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-8 tracking-tight">
            The speedcubing companion <br className="hidden md:block" />
            that levels with you
          </h1>

          <button
            onClick={() => navigate("/signin")}
            className="px-8 py-3 bg-foreground text-background font-medium rounded-full hover:opacity-90 transition-all shadow-xl shadow-foreground/10 active:scale-95"
          >
            Try for free
          </button>
        </div>
      </main>

      {/* Footer / Secondary Nav (Minimal as per original design) */}
      <footer className="mt-20 border-t border-foreground/5 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-foreground/40">
          <p>© 2026 Algobase Inc.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
