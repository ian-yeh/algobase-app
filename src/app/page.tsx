import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AlgoBaseLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-white hover:text-purple-400 transition-colors duration-200">
                AlgoBase
              </div>
            </Link>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Badge */}
            <Badge 
              variant="outline" 
              className="mb-8 bg-purple-950 text-purple-400 border-purple-800 py-1.5 px-4 animate-pulse"
            >
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Your Algorithm Knowledge Hub
            </Badge>
            
            {/* Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Master
              <span className="text-purple-400 block sm:inline sm:ml-4">
                Algorithms
              </span>
            </h1>
            
            {/* Hero Subtitle */}
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Build your algorithm knowledge with our comprehensive database. 
              Practice, learn, and excel in computational thinking.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/sign-in">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-4 text-lg font-semibold border-gray-700 hover:border-purple-400 hover:text-purple-400"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Why Choose Algobase?
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Everything you need to master algorithms in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-purple-400 rounded"></div>
                  </div>
                  <CardTitle className="text-white">
                    Comprehensive Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Access thousands of algorithms with detailed explanations and implementations.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 2 */}
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-purple-400 rounded-full"></div>
                  </div>
                  <CardTitle className="text-white">
                    Interactive Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Practice with interactive examples and visualizations to deepen understanding.
                  </p>
                </CardContent>
              </Card>
              
              {/* Feature 3 */}
              <Card className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors duration-200">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-900 rounded-xl flex items-center justify-center mb-2">
                    <div className="w-6 h-6 bg-purple-400 rounded-lg transform rotate-45"></div>
                  </div>
                  <CardTitle className="text-white">
                    Track Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Monitor your learning journey with detailed progress tracking and analytics.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">AlgoBase</div>
            <p className="text-gray-400 mb-8">
              Your trusted algorithm knowledge base
            </p>
            <div className="flex justify-center">
              <Link href="/sign-in">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:border-purple-500 hover:text-purple-400">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlgoBaseLanding;
