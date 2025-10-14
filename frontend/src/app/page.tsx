import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AlgoBaseLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center flex flex-col justify-center items-center">
        {/* Hero Badge */}
        <Badge
          variant="outline"
          className="mb-8 bg-muted/50 text-purple-400 border-border py-1.5 px-4 animate-pulse flex items-center"
        >
          <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
          Your Cubing Analyst
        </Badge>

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
          <Link href="/sign-in">
            <Button
              size="lg"
              className="w-full sm:w-auto px-12 py-4 text-lg font-semibold bg-purple-500 text-foreground hover:bg-purple-400"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlgoBaseLanding;
