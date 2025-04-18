import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, Calendar, Clock, Play, TrendingUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface DashboardData {
  recoveryPercentage: number;
  sessionCount: number;
  adherenceRate: number;
  nextSession: {
    date: string;
    exercises: {
      id: string;
      name: string;
      duration: number;
    }[];
  };
  recentProgress: {
    date: string;
    value: number;
  }[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with actual API call
        // const response = await api.get('/api/user/dashboard');
        // setData(response.data);
        
        // Mock data for demonstration
        setData({
          recoveryPercentage: 68,
          sessionCount: 24,
          adherenceRate: 85,
          nextSession: {
            date: new Date(Date.now() + 86400000).toISOString(),
            exercises: [
              { id: '1', name: 'Shoulder Flexion', duration: 10 },
              { id: '2', name: 'Rotator Cuff Strengthening', duration: 15 },
              { id: '3', name: 'Range of Motion Exercise', duration: 12 }
            ]
          },
          recentProgress: [
            { date: '2025-01-01', value: 42 },
            { date: '2025-01-08', value: 48 },
            { date: '2025-01-15', value: 55 },
            { date: '2025-01-22', value: 62 },
            { date: '2025-01-29', value: 68 }
          ]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-400 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-dark-300">
            Your rehabilitation journey is {data?.recoveryPercentage}% complete. Keep going!
          </p>
        </div>
        <div>
          <Link to="/planner">
            <Button variant="primary" icon={<Calendar />} iconPosition="left">
              View Weekly Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary-900/50 to-primary-800/30 border-primary-700/30">
          <CardContent className="flex items-center">
            <div className="mr-4 bg-primary-800/50 p-3 rounded-full">
              <TrendingUp className="text-primary-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data?.recoveryPercentage}%</h3>
              <p className="text-dark-300 text-sm">Recovery Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-900/50 to-secondary-800/30 border-secondary-700/30">
          <CardContent className="flex items-center">
            <div className="mr-4 bg-secondary-800/50 p-3 rounded-full">
              <Clock className="text-secondary-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data?.sessionCount}</h3>
              <p className="text-dark-300 text-sm">Total Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent-900/50 to-accent-800/30 border-accent-700/30">
          <CardContent className="flex items-center">
            <div className="mr-4 bg-accent-800/50 p-3 rounded-full">
              <Award className="text-accent-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data?.adherenceRate}%</h3>
              <p className="text-dark-300 text-sm">Plan Adherence</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Session */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Next Session</h2>
            <span className="text-sm text-dark-300">
              {new Date(data?.nextSession.date || '').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.nextSession.exercises.map((exercise) => (
                <div key={exercise.id} className="flex justify-between items-center p-3 bg-dark-700 rounded-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-900/50 rounded-full mr-3">
                      <Play size={16} className="text-primary-400" />
                    </div>
                    <span>{exercise.name}</span>
                  </div>
                  <span className="text-dark-300">{exercise.duration} min</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link to="/planner">
                <Button variant="primary" className="w-full">
                  Start Session
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Progress Chart */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recovery Progress</h2>
            <Link to="/report" className="text-primary-400 hover:text-primary-300 text-sm">
              View Full Report <ArrowRight size={16} className="inline ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 px-4">
              {data?.recentProgress.map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    <div
                      className="w-2 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                      style={{ height: `${point.value * 1.8}px` }}
                    ></div>
                    <span className="absolute -top-6 text-xs font-medium text-primary-400">
                      {point.value}%
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-dark-400">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/record">
                <Button variant="outline" size="sm" icon={<Calendar />} iconPosition="left">
                  View All Sessions
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/report">
                <Card className="hover:border-primary-600 transition-all duration-200 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <TrendingUp size={32} className="text-primary-500 mb-3" />
                    <h3 className="font-medium">View Reports</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/planner">
                <Card className="hover:border-secondary-600 transition-all duration-200 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Calendar size={32} className="text-secondary-500 mb-3" />
                    <h3 className="font-medium">Weekly Plan</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/record">
                <Card className="hover:border-accent-600 transition-all duration-200 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Clock size={32} className="text-accent-500 mb-3" />
                    <h3 className="font-medium">Session History</h3>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/profile">
                <Card className="hover:border-dark-500 transition-all duration-200 h-full">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <User size={32} className="text-dark-300 mb-3" />
                    <h3 className="font-medium">Profile</h3>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;