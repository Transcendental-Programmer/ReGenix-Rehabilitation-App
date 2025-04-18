import React, { useEffect, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Info, Play } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';

interface Exercise {
  id: string;
  name: string;
  description: string;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  targetArea: string;
}

interface DayPlan {
  date: string;
  focus: string;
  exercises: Exercise[];
}

interface WeeklyPlan {
  weekStart: string;
  weekEnd: string;
  days: DayPlan[];
}

const Planner: React.FC = () => {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchWeeklyPlan = async () => {
      try {
        // Replace with actual API call
        // const response = await api.get('/api/planner');
        // setWeeklyPlan(response.data);
        
        // Mock data for demonstration
        const mockStartDate = new Date(currentDate);
        mockStartDate.setDate(mockStartDate.getDate() - mockStartDate.getDay()); // Start of week (Sunday)
        
        const mockEndDate = new Date(mockStartDate);
        mockEndDate.setDate(mockEndDate.getDate() + 6); // End of week (Saturday)
        
        // Create mock days array with exercises
        const mockDays: DayPlan[] = [];
        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(mockStartDate);
          dayDate.setDate(dayDate.getDate() + i);
          
          // Skip days in the past
          if (dayDate < new Date(new Date().setHours(0, 0, 0, 0))) {
            continue;
          }
          
          // Create different focus areas for different days
          let focus = 'Rest Day';
          let exercises: Exercise[] = [];
          
          if (i === 1 || i === 4) { // Monday & Thursday
            focus = 'Shoulder Mobility';
            exercises = [
              {
                id: `ex-${i}-1`,
                name: 'Shoulder External Rotation',
                description: 'Lie on your side with your affected arm on top. Bend your elbow to 90 degrees. Keeping your elbow against your side, rotate your arm upward.',
                duration: 10,
                intensity: 'Medium',
                targetArea: 'Rotator Cuff'
              },
              {
                id: `ex-${i}-2`,
                name: 'Wall Slides',
                description: 'Stand with your back against a wall. Place your arms against the wall in a "W" position. Slowly slide your arms up the wall while maintaining contact.',
                duration: 8,
                intensity: 'Low',
                targetArea: 'Shoulders'
              },
              {
                id: `ex-${i}-3`,
                name: 'Pendulum Exercise',
                description: 'Lean over slightly, supporting yourself with one hand. Let your affected arm hang down. Swing your arm gently in small circles.',
                duration: 5,
                intensity: 'Low',
                targetArea: 'Shoulder Joint'
              }
            ];
          } else if (i === 2 || i === 5) { // Tuesday & Friday
            focus = 'Strength Training';
            exercises = [
              {
                id: `ex-${i}-1`,
                name: 'Theraband Row',
                description: 'Secure a resistance band to a fixed object. Hold the band with your arms extended. Pull the band toward your body, squeezing your shoulder blades together.',
                duration: 12,
                intensity: 'Medium',
                targetArea: 'Upper Back'
              },
              {
                id: `ex-${i}-2`,
                name: 'Isometric Shoulder Abduction',
                description: 'Stand with your affected arm at your side, elbow bent to 90 degrees. Press your elbow against a wall without moving it.',
                duration: 10,
                intensity: 'Medium',
                targetArea: 'Deltoids'
              }
            ];
          } else if (i === 3) { // Wednesday
            focus = 'Flexibility';
            exercises = [
              {
                id: `ex-${i}-1`,
                name: 'Cross-Body Stretch',
                description: 'Bring your affected arm across your chest. Use your other arm to gently pull your affected arm closer to your body.',
                duration: 8,
                intensity: 'Low',
                targetArea: 'Posterior Shoulder'
              },
              {
                id: `ex-${i}-2`,
                name: 'Doorway Stretch',
                description: 'Stand in a doorway with your arms on the doorframe, elbows bent at 90 degrees. Lean forward gently to feel a stretch in your chest and shoulders.',
                duration: 8,
                intensity: 'Low',
                targetArea: 'Pectorals'
              }
            ];
          } else if (i === 6) { // Saturday
            focus = 'Functional Training';
            exercises = [
              {
                id: `ex-${i}-1`,
                name: 'Overhead Reaching',
                description: 'Practice reaching for objects on high shelves using your affected arm. Start with lighter objects and gradually increase weight.',
                duration: 8,
                intensity: 'Medium',
                targetArea: 'Full Shoulder'
              },
              {
                id: `ex-${i}-2`,
                name: 'Diagonal Pattern D2 Flexion',
                description: 'Start with your arm across your body at the opposite hip. Move your arm up and out to the side in a diagonal pattern.',
                duration: 10,
                intensity: 'Medium',
                targetArea: 'Multiple Muscle Groups'
              }
            ];
          }
          
          if (i !== 0) { // Skip Sunday as rest day
            mockDays.push({
              date: dayDate.toISOString(),
              focus,
              exercises
            });
          }
        }
        
        setWeeklyPlan({
          weekStart: mockStartDate.toISOString(),
          weekEnd: mockEndDate.toISOString(),
          days: mockDays
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch planner data:', err);
        setError('Failed to load planner data. Please try again later.');
        setLoading(false);
      }
    };

    fetchWeeklyPlan();
  }, [currentDate]);

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    setLoading(true);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    setLoading(true);
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const openExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setModalOpen(true);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Weekly Rehabilitation Plan</h1>
          <p className="text-dark-300">
            Your personalized AI-generated exercise plan
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ChevronLeft />} 
            iconPosition="left"
            onClick={previousWeek}
          >
            Previous
          </Button>
          <span className="text-dark-200">
            {weeklyPlan && formatDateRange(weeklyPlan.weekStart, weeklyPlan.weekEnd)}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<ChevronRight />} 
            iconPosition="right"
            onClick={nextWeek}
          >
            Next
          </Button>
        </div>
      </div>

      {weeklyPlan && weeklyPlan.days.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="mx-auto mb-4 text-dark-400" size={48} />
            <h3 className="text-xl font-semibold mb-2">No Activities Planned</h3>
            <p className="text-dark-300 max-w-md mx-auto">
              There are no rehabilitation activities planned for this week. Please check back later or contact your therapist.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {weeklyPlan?.days.map((day, index) => (
            <Card key={index}>
              <CardHeader className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </h2>
                  <p className="text-sm text-dark-300">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="bg-dark-700 py-1 px-3 rounded-full text-sm">
                  {day.focus}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {day.exercises.map((exercise) => (
                  <div key={exercise.id} className="border border-dark-700 rounded-lg p-4 hover:border-primary-600 transition-all duration-200">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{exercise.name}</h3>
                      <div className="flex items-center text-dark-300 text-sm">
                        <Clock size={14} className="mr-1" />
                        <span>{exercise.duration} min</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          exercise.intensity === 'Low' ? 'bg-success-900/30 text-success-400' :
                          exercise.intensity === 'Medium' ? 'bg-warning-900/30 text-warning-400' :
                          'bg-error-900/30 text-error-400'
                        }`}>
                          {exercise.intensity}
                        </span>
                        <span className="px-2 py-1 bg-dark-700 rounded-full text-xs">
                          {exercise.targetArea}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Info size={16} />}
                          className="p-1"
                          onClick={() => openExerciseDetails(exercise)}
                        />
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Play size={16} />}
                          iconPosition="left"
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Exercise Details Modal */}
      {selectedExercise && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedExercise.name}
          footer={
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-dark-300 mb-1">Description</h4>
              <p>{selectedExercise.description}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-dark-300 mb-1">Duration</h4>
                <p className="flex items-center">
                  <Clock size={16} className="mr-2 text-primary-400" />
                  {selectedExercise.duration} minutes
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-dark-300 mb-1">Intensity</h4>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  selectedExercise.intensity === 'Low' ? 'bg-success-900/30 text-success-400' :
                  selectedExercise.intensity === 'Medium' ? 'bg-warning-900/30 text-warning-400' :
                  'bg-error-900/30 text-error-400'
                }`}>
                  {selectedExercise.intensity}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-dark-300 mb-1">Target Area</h4>
                <p>{selectedExercise.targetArea}</p>
              </div>
            </div>
            
            <div className="pt-4">
              <Button variant="primary" className="w-full" icon={<Play />} iconPosition="left">
                Start Exercise
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Planner;