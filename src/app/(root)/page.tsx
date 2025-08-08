import React from 'react';
import Link from 'next/link';

const AlgoBaseLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="text-2xl font-bold text-black hover:text-purple-600 transition-colors duration-200">
                AlgoBase
              </div>
            </Link>
            
            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up"
                className="px-6 py-2 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Sign Up
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
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-sm font-medium mb-8 animate-pulse">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Your Algorithm Knowledge Hub
            </div>
            
            {/* Hero Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-black mb-8 leading-tight">
              Master
              <span className="text-purple-600 block sm:inline sm:ml-4">
                Algorithms
              </span>
            </h1>
            
            {/* Hero Subtitle */}
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Build your algorithm knowledge with our comprehensive database. 
              Practice, learn, and excel in computational thinking.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-xl hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link 
                href="/sign-in"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 text-lg font-semibold rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all duration-200 transform hover:scale-105"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                Why Choose AlgoBase?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to master algorithms in one place
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-purple-600 rounded"></div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Comprehensive Database
                </h3>
                <p className="text-gray-600">
                  Access thousands of algorithms with detailed explanations and implementations.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Interactive Learning
                </h3>
                <p className="text-gray-600">
                  Practice with interactive examples and visualizations to deepen understanding.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                  <div className="w-6 h-6 bg-purple-600 rounded-lg transform rotate-45"></div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">
                  Track Progress
                </h3>
                <p className="text-gray-600">
                  Monitor your learning journey with detailed progress tracking and analytics.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4">AlgoBase</div>
            <p className="text-gray-400 mb-8">
              Your trusted algorithm knowledge base
            </p>
            <div className="flex justify-center space-x-8">
              <Link 
                href="/sign-up"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Get Started
              </Link>
              <Link 
                href="/sign-in"
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-400 transition-colors duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AlgoBaseLanding;
