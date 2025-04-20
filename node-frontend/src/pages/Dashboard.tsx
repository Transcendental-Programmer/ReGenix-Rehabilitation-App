// import React, { useEffect, useState } from 'react';
// import { ArrowRight, Award, Calendar, Clock, Play, TrendingUp, User } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import Card, { CardContent, CardHeader } from '../components/Card';
// import Button from '../components/Button';
// import LoadingSpinner from '../components/LoadingSpinner';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';

// interface DashboardData {
//   recoveryPercentage: number;
//   sessionCount: number;
//   adherenceRate: number;
//   nextSession: {
//     date: string;
//     exercises: {
//       id: string;
//       name: string;
//       duration: number;
//     }[];
//   };
//   recentProgress: {
//     date: string;
//     value: number;
//   }[];
// }

// const Dashboard: React.FC = () => {
//   const { user } = useAuth();
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         // Replace with actual API call
//         // const response = await api.get('/api/user/dashboard');
//         // setData(response.data);
        
//         // Mock data for demonstration
//         setData({
//           recoveryPercentage: 68,
//           sessionCount: 24,
//           adherenceRate: 85,
//           nextSession: {
//             date: new Date(Date.now() + 86400000).toISOString(),
//             exercises: [
//               { id: '1', name: 'Shoulder Flexion', duration: 10 },
//               { id: '2', name: 'Rotator Cuff Strengthening', duration: 15 },
//               { id: '3', name: 'Range of Motion Exercise', duration: 12 }
//             ]
//           },
//           recentProgress: [
//             { date: '2025-01-01', value: 42 },
//             { date: '2025-01-08', value: 48 },
//             { date: '2025-01-15', value: 55 },
//             { date: '2025-01-22', value: 62 },
//             { date: '2025-01-29', value: 68 }
//           ]
//         });
        
//         setLoading(false);
//       } catch (err) {
//         console.error('Failed to fetch dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-[80vh] flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-[80vh] flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-error-400 mb-4">{error}</p>
//           <Button variant="primary" onClick={() => window.location.reload()}>
//             Retry
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
//         <div>
//           <h1 className="text-3xl font-bold mb-2">
//             Welcome back, {(user?.name || 'User').toUpperCase()}
//           </h1>
//           <p className="text-dark-300">
//             Your training journey is {data?.recoveryPercentage}% complete. Keep going!
//           </p>
//         </div>
//         <div>
//           <Link to="/planner">
//             <Button variant="primary" icon={<Calendar />} iconPosition="left">
//               View Weekly Plan
//             </Button>
//           </Link>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <Card className="bg-gradient-to-br from-primary-900/50 to-primary-800/30 border-primary-700/30">
//           <CardContent className="flex items-center">
//             <div className="mr-4 bg-primary-800/50 p-3 rounded-full">
//               <TrendingUp className="text-primary-300" size={24} />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold">{data?.recoveryPercentage}%</h3>
//               <p className="text-dark-300 text-sm">Training Progress</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-secondary-900/50 to-secondary-800/30 border-secondary-700/30">
//           <CardContent className="flex items-center">
//             <div className="mr-4 bg-secondary-800/50 p-3 rounded-full">
//               <Clock className="text-secondary-300" size={24} />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold">{data?.sessionCount}</h3>
//               <p className="text-dark-300 text-sm">Total Sessions</p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="bg-gradient-to-br from-accent-900/50 to-accent-800/30 border-accent-700/30">
//           <CardContent className="flex items-center">
//             <div className="mr-4 bg-accent-800/50 p-3 rounded-full">
//               <Award className="text-accent-300" size={24} />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold">{data?.adherenceRate}%</h3>
//               <p className="text-dark-300 text-sm">Plan Adherence</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Next Session */}
//         <Card>
//           <CardHeader className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">Next Session</h2>
//             <span className="text-sm text-dark-300">
//               {new Date(data?.nextSession.date || '').toLocaleDateString('en-US', {
//                 weekday: 'long',
//                 month: 'short',
//                 day: 'numeric'
//               })}
//             </span>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {data?.nextSession.exercises.map((exercise) => (
//                 <div key={exercise.id} className="flex justify-between items-center p-3 bg-dark-700 rounded-md">
//                   <div className="flex items-center">
//                     <div className="p-2 bg-primary-900/50 rounded-full mr-3">
//                       <Play size={16} className="text-primary-400" />
//                     </div>
//                     <span>{exercise.name}</span>
//                   </div>
//                   <span className="text-dark-300">{exercise.duration} min</span>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-6">
//               <Link to="/planner">
//                 <Button variant="primary" className="w-full">
//                   Start Session
//                 </Button>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Progress Chart */}
//         <Card>
//           <CardHeader className="flex justify-between items-center">
//             <h2 className="text-xl font-semibold">Training Progress</h2>
//             <Link to="/report" className="text-primary-400 hover:text-primary-300 text-sm">
//               View Full Report <ArrowRight size={16} className="inline ml-1" />
//             </Link>
//           </CardHeader>
//           <CardContent>
//             <div className="flex items-end justify-between h-40 px-4">
//               {data?.recentProgress.map((point, index) => (
//                 <div key={index} className="flex flex-col items-center">
//                   <div className="relative flex flex-col items-center">
//                     <div
//                       className="w-2 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
//                       style={{ height: `${point.value * 1.8}px` }}
//                     ></div>
//                     <span className="absolute -top-6 text-xs font-medium text-primary-400">
//                       {point.value}%
//                     </span>
//                   </div>
//                   <span className="mt-2 text-xs text-dark-400">
//                     {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                   </span>
//                 </div>
//               ))}
//             </div>
//             <div className="mt-4 flex justify-center">
//               <Link to="/record">
//                 <Button variant="outline" size="sm" icon={<Calendar />} iconPosition="left">
//                   View All Sessions
//                 </Button>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Quick Links */}
//         <Card>
//           <CardHeader>
//             <h2 className="text-xl font-semibold">Quick Actions</h2>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-2 gap-4">
//               <Link to="/report">
//                 <Card className="hover:border-primary-600 transition-all duration-200 h-full">
//                   <CardContent className="flex flex-col items-center justify-center p-6 text-center">
//                     <TrendingUp size={32} className="text-primary-500 mb-3" />
//                     <h3 className="font-medium">View Reports</h3>
//                   </CardContent>
//                 </Card>
//               </Link>
              
//               <Link to="/planner">
//                 <Card className="hover:border-secondary-600 transition-all duration-200 h-full">
//                   <CardContent className="flex flex-col items-center justify-center p-6 text-center">
//                     <Calendar size={32} className="text-secondary-500 mb-3" />
//                     <h3 className="font-medium">Weekly Plan</h3>
//                   </CardContent>
//                 </Card>
//               </Link>
              
//               <Link to="/record">
//                 <Card className="hover:border-accent-600 transition-all duration-200 h-full">
//                   <CardContent className="flex flex-col items-center justify-center p-6 text-center">
//                     <Clock size={32} className="text-accent-500 mb-3" />
//                     <h3 className="font-medium">Session History</h3>
//                   </CardContent>
//                 </Card>
//               </Link>
              
//               <Link to="/profile">
//                 <Card className="hover:border-dark-500 transition-all duration-200 h-full">
//                   <CardContent className="flex flex-col items-center justify-center p-6 text-center">
//                     <User size={32} className="text-dark-300 mb-3" />
//                     <h3 className="font-medium">Profile</h3>
//                   </CardContent>
//                 </Card>
//               </Link>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



import React, { useEffect, useState } from 'react';
import { ArrowRight, Award, Calendar, Clock, TrendingUp, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface DashboardData {
  overview: {
    totalSessions: number;
    totalTimeSpent: number;
    averageSessionDuration: number;
    mostPerformedExercise: string | null;
  };
  exerciseDistribution: {
    exercise: string;
    count: number;
  }[];
}

const EXERCISE_TYPES = [
  'Shoulder Flexion',
  'Shoulder Extension',
  'Shoulder Abduction',
  'Shoulder Rotation',
  'Elbow Flexion',
  'Elbow Extension'
];

// For testing/development - mock data to use when API fails
const MOCK_DATA: DashboardData = {
  overview: {
    totalSessions: 24,
    totalTimeSpent: 360,
    averageSessionDuration: 15,
    mostPerformedExercise: 'Shoulder Flexion'
  },
  exerciseDistribution: [
    { exercise: 'Shoulder Flexion', count: 10 },
    { exercise: 'Shoulder Extension', count: 8 },
    { exercise: 'Shoulder Abduction', count: 5 },
    { exercise: 'Shoulder Rotation', count: 7 },
    { exercise: 'Elbow Flexion', count: 3 },
    { exercise: 'Elbow Extension', count: 2 }
  ]
};

const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // If not authenticated or no user, don't try to fetch
      if (!isAuthenticated || !user) {
        console.warn('User not authenticated or user data not available');
        setLoading(false);
        setError('Please log in to view your dashboard');
        return;
      }

      try {
        // Make sure we have a user ID
        if (!user.id) {
          console.warn('User ID not found');
          throw new Error('User ID not found');
        }
        
        // Get the JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No auth token found');
          throw new Error('Authentication token not found');
        }
        
        // Log the URL we're calling for debugging
        const url = `http://localhost:5000/api/dashboard/user/${user.id}/summary`;
        console.log('Fetching dashboard data from:', url);
        
        // Make the API request with the token in the Authorization header
        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response:', response.data);
        
        setData(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        // More detailed error logging
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error response data:', err.response.data);
          console.error('Error response status:', err.response.status);
          console.error('Error response headers:', err.response.headers);
          
          // If unauthorized, maybe the token expired
          if (err.response.status === 401) {
            setError('Your session has expired. Please log in again.');
          } else {
            setError(`API Error: ${err.response.data.message || 'Unknown server error'}`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('Could not connect to the server. Please check your internet connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', err.message);
          setError(`Failed to load dashboard data: ${err.message || 'Unknown error'}`);
        }
        
        // For development - use mock data if API fails and useMock is true
        if (useMock) {
          console.log('Using mock data instead');
          setData(MOCK_DATA);
          setError('');
        }
        
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, isAuthenticated, useMock]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !useMock) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-error-400 mb-4">{error}</p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setUseMock(true)}
            >
              Use Demo Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Create a map of exercise counts, initialize all to zero
  const exerciseCounts = EXERCISE_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as Record<string, number>);

  // Fill in the actual counts from the data
  data?.exerciseDistribution?.forEach(item => {
    if (EXERCISE_TYPES.includes(item.exercise)) {
      exerciseCounts[item.exercise] = item.count;
    }
  });

  // Find the max count for scaling the chart
  const maxCount = Math.max(...Object.values(exerciseCounts), 1);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {(user?.name || 'User').toUpperCase()}
          </h1>
          <p className="text-dark-300">
            Keep up with your rehabilitation progress!
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
              <Clock className="text-primary-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data?.overview?.totalTimeSpent || 0} min</h3>
              <p className="text-dark-300 text-sm">Total Time Spent</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary-900/50 to-secondary-800/30 border-secondary-700/30">
          <CardContent className="flex items-center">
            <div className="mr-4 bg-secondary-800/50 p-3 rounded-full">
              <TrendingUp className="text-secondary-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{data?.overview?.totalSessions || 0}</h3>
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
              <h3 className="text-xl font-semibold">{data?.overview?.averageSessionDuration || 0} min</h3>
              <p className="text-dark-300 text-sm">Avg Session Duration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Performed Exercise Card - Only show if there is a most performed exercise */}
      {data?.overview?.mostPerformedExercise && (
        <Card className="mb-8">
          <CardContent className="flex items-center">
            <div className="mr-4 bg-primary-800/50 p-3 rounded-full">
              <Award className="text-primary-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Most Performed Exercise</h3>
              <p className="text-dark-300">{data.overview.mostPerformedExercise}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercises Performed Chart */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Different Exercises Performed</h2>
            <Link to="/report" className="text-primary-400 hover:text-primary-300 text-sm">
              View Full Report <ArrowRight size={16} className="inline ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 px-4">
              {Object.entries(exerciseCounts).map(([exercise, count], index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    <div
                      className="w-2 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm"
                      style={{ 
                        height: count > 0 ? `${(count / maxCount) * 120}px` : '4px',
                        minHeight: '4px'
                      }}
                    ></div>
                    <span className="absolute -top-6 text-xs font-medium text-primary-400">
                      {count}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-dark-400 text-center max-w-16 truncate" title={exercise}>
                    {exercise.split(' ')[0]}
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

      {/* Debug Info - Remove this in production */}
      {useMock && (
        <div className="mt-8 p-4 bg-warning-900/20 border border-warning-700/30 rounded-md">
          <p className="text-warning-300 text-sm font-medium">⚠️ Using Demo Data - API connection not established</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;