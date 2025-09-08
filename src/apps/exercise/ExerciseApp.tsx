import React, { useState, useEffect, useCallback } from 'react';
import BackButton from '../../components/BackButton';
import { Exercise, WorkoutSchedule, ViewMode } from './types';
import { defaultExercises } from './defaultExercises';
import { defaultSchedules } from './defaultSchedules';
import ExerciseManager from './components/ExerciseManager';
import ScheduleManager from './components/ScheduleManager';
import ScheduleCreator from './components/ScheduleCreator';
import './ExerciseApp.css';

const ExerciseApp: React.FC = () => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
    const [currentView, setCurrentView] = useState<ViewMode>('exercises');
    const [selectedSchedule, setSelectedSchedule] = useState<WorkoutSchedule | null>(null);

    // Storage keys
    const EXERCISES_KEY = 'productivity-exercises';
    const SCHEDULES_KEY = 'productivity-schedules';

    // Load data from localStorage
    const loadData = useCallback((): void => {
        try {
            // Load exercises
            const storedExercises = localStorage.getItem(EXERCISES_KEY);
            if (storedExercises) {
                const parsedExercises: Exercise[] = JSON.parse(storedExercises);
                setExercises(parsedExercises);
            } else {
                // First time setup - load default exercises
                setExercises(defaultExercises);
                localStorage.setItem(EXERCISES_KEY, JSON.stringify(defaultExercises));
            }

            // Load schedules
            const storedSchedules = localStorage.getItem(SCHEDULES_KEY);
            if (storedSchedules) {
                const parsedSchedules: WorkoutSchedule[] = JSON.parse(storedSchedules);
                setSchedules(parsedSchedules);
            } else {
                // First time setup - load default schedules
                setSchedules(defaultSchedules);
                localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
            }
        } catch (error) {
            console.error('Error loading exercise data:', error);
            // Fallback to defaults
            setExercises(defaultExercises);
        }
    }, [EXERCISES_KEY, SCHEDULES_KEY]);

    // Save exercises to localStorage
    const saveExercises = useCallback((exercisesToSave: Exercise[]): void => {
        try {
            localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercisesToSave));
        } catch (error) {
            console.error('Error saving exercises:', error);
        }
    }, [EXERCISES_KEY]);

    // Save schedules to localStorage
    const saveSchedules = useCallback((schedulesToSave: WorkoutSchedule[]): void => {
        try {
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedulesToSave));
        } catch (error) {
            console.error('Error saving schedules:', error);
        }
    }, [SCHEDULES_KEY]);

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-save exercises when they change
    useEffect(() => {
        if (exercises.length > 0) {
            saveExercises(exercises);
        }
    }, [exercises, saveExercises]);

    // Auto-save schedules when they change
    useEffect(() => {
        if (schedules.length > 0) {
            saveSchedules(schedules);
        }
    }, [schedules, saveSchedules]);

    // Exercise management functions
    const addExercise = (exercise: Omit<Exercise, 'id' | 'isDefault'>): void => {
        const newExercise: Exercise = {
            ...exercise,
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            isDefault: false
        };
        setExercises(prev => [...prev, newExercise]);
    };

    const updateExercise = (id: string, updates: Partial<Exercise>): void => {
        setExercises(prev => prev.map(ex =>
            ex.id === id ? { ...ex, ...updates } : ex
        ));
    };

    const deleteExercise = (id: string): void => {
        // Don't allow deletion of default exercises
        setExercises(prev => prev.filter(ex => ex.id !== id || ex.isDefault));
    };

    // Schedule management functions
    const addSchedule = (schedule: Omit<WorkoutSchedule, 'id' | 'createdAt' | 'lastModified'>): void => {
        const now = new Date().toISOString();
        const newSchedule: WorkoutSchedule = {
            ...schedule,
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            lastModified: now
        };
        setSchedules(prev => [...prev, newSchedule]);
    };

    const updateSchedule = (id: string, updates: Partial<WorkoutSchedule>): void => {
        setSchedules(prev => prev.map(sched =>
            sched.id === id
                ? { ...sched, ...updates, lastModified: new Date().toISOString() }
                : sched
        ));
    };

    const deleteSchedule = (id: string): void => {
        setSchedules(prev => prev.filter(sched => sched.id !== id));
        if (selectedSchedule?.id === id) {
            setSelectedSchedule(null);
        }
    };

    const resetToDefaults = (): void => {
        if (window.confirm('Reset all exercises to defaults? This will remove your custom exercises.')) {
            setExercises(defaultExercises);
            localStorage.setItem(EXERCISES_KEY, JSON.stringify(defaultExercises));
        }
    };

    const resetSchedulesToDefaults = (): void => {
        if (window.confirm('Reset all schedules to defaults? This will remove your custom schedules and load the updated routines including the new comprehensive morning routine.')) {
            setSchedules(defaultSchedules);
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
        }
    };

    const addNewDefaultSchedules = (): void => {
        if (window.confirm('Add new default schedules? This will add the comprehensive morning routine and keep your existing schedules.')) {
            // Get schedules that are not already in defaults (avoid duplicates)
            const existingIds = schedules.map(s => s.id);
            const newSchedules = defaultSchedules.filter(ds => !existingIds.includes(ds.id));

            if (newSchedules.length > 0) {
                const updatedSchedules = [...schedules, ...newSchedules];
                setSchedules(updatedSchedules);
                localStorage.setItem(SCHEDULES_KEY, JSON.stringify(updatedSchedules));
                alert(`Added ${newSchedules.length} new default schedule(s): ${newSchedules.map(s => s.name).join(', ')}`);
            } else {
                alert('All default schedules are already present. Current schedules: ' + schedules.map(s => s.name).join(', '));
            }
        }
    };

    return (
        <div className="exercise-app">
            <BackButton />
            <div className="exercise-header">
                <div className="header-content">
                    <h1>💪 Exercise Manager</h1>
                    <p>Manage exercises and create workout schedules</p>
                </div>

                <nav className="exercise-nav">
                    <button
                        className={currentView === 'exercises' ? 'active' : ''}
                        onClick={() => setCurrentView('exercises')}
                    >
                        📋 Exercises
                    </button>
                    <button
                        className={currentView === 'schedules' ? 'active' : ''}
                        onClick={() => setCurrentView('schedules')}
                    >
                        📅 Schedules
                    </button>
                    <button
                        className={currentView === 'create-schedule' ? 'active' : ''}
                        onClick={() => {
                            setCurrentView('create-schedule');
                            setSelectedSchedule(null);
                        }}
                    >
                        ➕ Create Schedule
                    </button>
                </nav>
            </div>

            <div className="exercise-content">
                {currentView === 'exercises' && (
                    <ExerciseManager
                        exercises={exercises}
                        onAddExercise={addExercise}
                        onUpdateExercise={updateExercise}
                        onDeleteExercise={deleteExercise}
                        onResetToDefaults={resetToDefaults}
                    />
                )}

                {currentView === 'schedules' && (
                    <ScheduleManager
                        schedules={schedules}
                        exercises={exercises}
                        onDeleteSchedule={deleteSchedule}
                        onEditSchedule={(schedule) => {
                            setSelectedSchedule(schedule);
                            setCurrentView('create-schedule');
                        }}
                        onResetToDefaults={resetSchedulesToDefaults}
                        onAddNewDefaults={addNewDefaultSchedules}
                    />
                )}

                {currentView === 'create-schedule' && (
                    <ScheduleCreator
                        exercises={exercises}
                        schedule={selectedSchedule}
                        onSaveSchedule={(schedule) => {
                            if (selectedSchedule) {
                                updateSchedule(selectedSchedule.id, schedule);
                            } else {
                                addSchedule(schedule);
                            }
                            setCurrentView('schedules');
                            setSelectedSchedule(null);
                        }}
                        onCancel={() => {
                            setCurrentView('schedules');
                            setSelectedSchedule(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ExerciseApp;
