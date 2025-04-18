import React, { useEffect, useState } from 'react';
import { Calendar, Check, ChevronDown, Clock, Search, Star } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  exercises: {
    name: string;
    completed: boolean;
    accuracy?: number;
  }[];
  notes?: string;
  painLevel?: number;
}

const Record: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'thisWeek' | 'lastMonth'>('all');

  useEffect(() => {
    const fetchSessionLogs = async () => {
      try {
        // Replace with actual API call
        // const response = await api.get('/api/session/logs');
        // setSessions(response.data);
        
        // Mock data for demonstration
        const mockSessions: SessionRecord[] = [];
        
        // Generate 10 mock sessions with varying dates
        for (let i = 0; i < 10; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i * 3); // Every 3 days back
          
          mockSessions.push({
            id: `session-${i}`,
            date: date.toISOString(),
            duration: 25 + Math.floor(Math.random() * 20), // 25-45 minutes
            exercises: [
              {
                name: 'Shoulder External Rotation',
                completed: true,
                accuracy: 85 + Math.floor(Math.random() * 15) // 85-100%
              },
              {
                name: 'Wall Slides',
                completed: true,
                accuracy: 80 + Math.floor(Math.random() * 20) // 80-100%
              },
              {
                name: i % 4 === 0 ? 'Pendulum Exercise' : 'Diagonal Pattern D2 Flexion',
                completed: i % 5 !== 0, // Some incomplete
                accuracy: i % 5 !== 0 ? 75 + Math.floor(Math.random() * 20) : undefined // 75-95%
              }
            ],
            notes: i % 3 === 0 ? 'Felt some discomfort during the last exercise. Will reduce intensity next time.' : undefined,
            painLevel: i % 2 === 0 ? 1 + Math.floor(Math.random() * 3) : undefined // 1-3 pain level
          });
        }
        
        setSessions(mockSessions);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch session logs:', err);
        setError('Failed to load session history. Please try again later.');
        setLoading(false);
      }
    };

    fetchSessionLogs();
  }, []);

  const toggleExpand = (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
    }
  };

  const filterSessions = () => {
    if (!sessions.length) return [];
    
    let filteredSessions = [...sessions];
    
    // Apply date filter
    if (filter === 'thisWeek') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filteredSessions = filteredSessions.filter(
        session => new Date(session.date) >= oneWeekAgo
      );
    } else if (filter === 'lastMonth') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filteredSessions = filteredSessions.filter(
        session => new Date(session.date) >= oneMonthAgo
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredSessions = filteredSessions.filter(session => 
        session.exercises.some(ex => ex.name.toLowerCase().includes(term)) ||
        (session.notes && session.notes.toLowerCase().includes(term))
      );
    }
    
    return filteredSessions;
  };

  const calculateCompletionRate = (session: SessionRecord) => {
    const completed = session.exercises.filter(ex => ex.completed).length;
    return Math.round((completed / session.exercises.length) * 100);
  };

  const calculateAverageAccuracy = (session: SessionRecord) => {
    const accuracies = session.exercises
      .filter(ex => ex.completed && ex.accuracy !== undefined)
      .map(ex => ex.accuracy as number);
    
    if (!accuracies.length) return 'N/A';
    
    const average = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    return `${Math.round(average)}%`;
  };

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

  const filteredSessions = filterSessions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Session History</h1>
          <p className="text-dark-300">
            Track your rehabilitation progress over time
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-dark-400" />
          </div>
          <input
            type="text"
            placeholder="Search exercises or notes..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <select
            className="input bg-dark-800 appearance-none pr-10"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
          >
            <option value="all">All Sessions</option>
            <option value="thisWeek">This Week</option>
            <option value="lastMonth">Last Month</option>
          </select>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto mb-4 text-dark-400" size={48} />
            <h3 className="text-xl font-semibold mb-2">No Sessions Found</h3>
            <p className="text-dark-300 max-w-md mx-auto">
              {searchTerm || filter !== 'all'
                ? "No sessions match your current filters. Try adjusting your search or filter criteria."
                : "You haven't completed any rehabilitation sessions yet. Start a session from your planner."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-visible">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(session.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <Calendar size={18} className="text-primary-400 mr-2" />
                      <h3 className="font-medium">
                        {new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                    </div>
                    <div className="flex items-center mt-1 text-sm text-dark-300">
                      <Clock size={14} className="mr-1" />
                      <span>{session.duration} minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <div className="text-sm text-dark-300">Completion</div>
                      <div className="font-medium">{calculateCompletionRate(session)}%</div>
                    </div>
                    
                    <div className="text-right hidden md:block">
                      <div className="text-sm text-dark-300">Accuracy</div>
                      <div className="font-medium">{calculateAverageAccuracy(session)}</div>
                    </div>
                    
                    <ChevronDown 
                      size={20} 
                      className={`transform transition-transform duration-200 ${
                        expandedSession === session.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </div>
                </div>
              </div>
              
              {expandedSession === session.id && (
                <div className="px-4 pb-4 pt-2 border-t border-dark-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-3">Exercises</h4>
                      <div className="space-y-3">
                        {session.exercises.map((exercise, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-dark-700 rounded-md">
                            <div className="flex items-center">
                              {exercise.completed ? (
                                <Check size={16} className="text-success-500 mr-3" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-dark-400 mr-3" />
                              )}
                              <span>{exercise.name}</span>
                            </div>
                            {exercise.accuracy && (
                              <span className="text-dark-200">{exercise.accuracy}%</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      {session.painLevel !== undefined && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Pain Level</h4>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <Star
                                key={level}
                                size={20}
                                className={`${
                                  level <= session.painLevel! 
                                    ? 'text-warning-500 fill-warning-500' 
                                    : 'text-dark-600'
                                } mr-1`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {session.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <div className="p-3 bg-dark-700 rounded-md">
                            <p className="text-dark-200">{session.notes}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex md:justify-end mt-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Record;