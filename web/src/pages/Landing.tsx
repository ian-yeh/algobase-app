import React from "react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col justify-center items-center">
        {/* Hero Badge */}

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold mb-8 leading-tight">
          Keeping track of your solves
          <span className="text-purple-400 block sm:inline sm:ml-4">
            should be easy.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
          Level up your speedcubing skills with Algobase.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
