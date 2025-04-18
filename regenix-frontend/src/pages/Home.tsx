import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, CheckCircle, Clock, Play, Zap } from 'lucide-react';
import Button from '../components/Button';

const Home: React.FC = () => {
  return (
    <div className="bg-dark-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-secondary-900 opacity-20"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Recover Faster with AI-Powered Rehabilitation
            </h1>
            <p className="text-lg md:text-xl text-dark-200 mb-8">
              Personalized rehabilitation plans, progress tracking, and expert guidance 
              at your fingertips. Get back to your best self with RehabPro.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={<ArrowRight />} iconPosition="right">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your Path to Recovery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-6 hover:border-primary-600 transition-all duration-300">
              <div className="bg-primary-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Activity className="text-primary-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Plans</h3>
              <p className="text-dark-300">
                AI-generated rehabilitation plans customized to your specific injury, 
                needs, and progress. Adapt as you improve.
              </p>
            </div>
            <div className="card p-6 hover:border-secondary-600 transition-all duration-300">
              <div className="bg-secondary-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <CheckCircle className="text-secondary-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
              <p className="text-dark-300">
                Visualize your recovery journey with detailed analytics, statistics 
                and progress reports that show how far you've come.
              </p>
            </div>
            <div className="card p-6 hover:border-accent-600 transition-all duration-300">
              <div className="bg-accent-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Clock className="text-accent-400 w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Guided Sessions</h3>
              <p className="text-dark-300">
                Follow along with detailed exercise instructions, timers, and form 
                guides to ensure you're rehabilitating correctly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">
              See RehabPro in Action
            </h2>
            <p className="text-dark-300 text-center mb-8">
              Watch how RehabPro helps users through their rehabilitation journey with 
              intuitive interfaces and powerful tools.
            </p>
            <div className="aspect-video bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-center mb-8 overflow-hidden">
              <div className="text-center p-8">
                <Play size={60} className="mx-auto text-primary-500 mb-4" />
                <p className="text-dark-200">Demo Video Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-dark-900 to-dark-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Zap className="mx-auto text-primary-500 mb-6" size={40} />
            <h2 className="text-3xl font-bold mb-6">
              Ready to Transform Your Recovery?
            </h2>
            <p className="text-dark-200 mb-8">
              Join thousands of users who've accelerated their rehabilitation with our 
              intelligent platform. Get started today and take control of your recovery.
            </p>
            <Link to="/register">
              <Button variant="primary" size="lg">
                Start Your Recovery Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;