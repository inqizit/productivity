import React, { useState, useEffect, useCallback } from 'react';
import BackButton from '../../components/BackButton';
import { DailySchedule, ViewMode } from './types';
import { defaultScheduleTemplates } from './defaultScheduleTemplates';
import ScheduleManager from './components/ScheduleManager';
import ScheduleCreator from './components/ScheduleCreator';
import ScheduleViewer from './components/ScheduleViewer';
import './ScheduleApp.css';

const ScheduleApp: React.FC = () => {
    const [schedules, setSchedules] = useState<DailySchedule[]>([]);
    const [currentView, setCurrentView] = useState<ViewMode>('schedules');
    const [selectedSchedule, setSelectedSchedule] = useState<DailySchedule | null>(null);

    // Storage key
    const SCHEDULES_KEY = 'productivity-daily-schedules';

    // Load schedules from localStorage
    const loadSchedules = useCallback((): void => {
        try {
            const stored = localStorage.getItem(SCHEDULES_KEY);
            if (stored) {
                const parsedSchedules: DailySchedule[] = JSON.parse(stored);
                setSchedules(parsedSchedules);
            } else {
                // First time setup - create default schedules from templates
                const defaultSchedules: DailySchedule[] = defaultScheduleTemplates.map((template, index) => ({
                    id: `default_${index}`,
                    name: template.name,
                    description: template.description,
                    timeBlocks: template.blocks.map((block, blockIndex) => ({
                        ...block,
                        id: `block_${index}_${blockIndex}`
                    })),
                    startTime: template.startTime,
                    endTime: template.blocks[template.blocks.length - 1]?.endTime || '22:00',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    isDefault: true
                }));

                setSchedules(defaultSchedules);
                localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }, [SCHEDULES_KEY]);

    // Save schedules to localStorage
    const saveSchedules = useCallback((schedulesToSave: DailySchedule[]): void => {
        try {
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedulesToSave));
        } catch (error) {
            console.error('Error saving schedules:', error);
        }
    }, [SCHEDULES_KEY]);

    // Load schedules on component mount
    useEffect(() => {
        loadSchedules();
    }, [loadSchedules]);

    // Auto-save schedules when they change
    useEffect(() => {
        if (schedules.length > 0) {
            saveSchedules(schedules);
        }
    }, [schedules, saveSchedules]);

    // Schedule management functions
    const addSchedule = (schedule: Omit<DailySchedule, 'id' | 'createdAt' | 'lastModified' | 'isDefault'>): void => {
        const now = new Date().toISOString();
        const newSchedule: DailySchedule = {
            ...schedule,
            id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: now,
            lastModified: now,
            isDefault: false
        };
        setSchedules(prev => [...prev, newSchedule]);
    };

    const updateSchedule = (id: string, updates: Partial<DailySchedule>): void => {
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
        if (window.confirm('Reset all schedules to defaults? This will remove your custom schedules.')) {
            const defaultSchedules: DailySchedule[] = defaultScheduleTemplates.map((template, index) => ({
                id: `default_${index}`,
                name: template.name,
                description: template.description,
                timeBlocks: template.blocks.map((block, blockIndex) => ({
                    ...block,
                    id: `block_${index}_${blockIndex}`
                })),
                startTime: template.startTime,
                endTime: template.blocks[template.blocks.length - 1]?.endTime || '22:00',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString(),
                isDefault: true
            }));

            setSchedules(defaultSchedules);
            localStorage.setItem(SCHEDULES_KEY, JSON.stringify(defaultSchedules));
        }
    };

    return (
        <div className="schedule-app">
            <BackButton />
            <div className="schedule-header">
                <div className="header-content">
                    <h1>📅 Schedule Manager</h1>
                    <p>Create and manage your daily time schedules with 30-minute blocks</p>
                </div>

                <nav className="schedule-nav">
                    <button
                        className={currentView === 'schedules' ? 'active' : ''}
                        onClick={() => {
                            setCurrentView('schedules');
                            setSelectedSchedule(null);
                        }}
                    >
                        📋 My Schedules
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

            <div className="schedule-content">
                {currentView === 'schedules' && (
                    <ScheduleManager
                        schedules={schedules}
                        onDeleteSchedule={deleteSchedule}
                        onEditSchedule={(schedule) => {
                            setSelectedSchedule(schedule);
                            setCurrentView('create-schedule');
                        }}
                        onViewSchedule={(schedule) => {
                            setSelectedSchedule(schedule);
                            setCurrentView('view-schedule');
                        }}
                        onResetToDefaults={resetToDefaults}
                    />
                )}

                {currentView === 'create-schedule' && (
                    <ScheduleCreator
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

                {currentView === 'view-schedule' && selectedSchedule && (
                    <ScheduleViewer
                        schedule={selectedSchedule}
                        onEdit={() => setCurrentView('create-schedule')}
                        onBack={() => {
                            setCurrentView('schedules');
                            setSelectedSchedule(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ScheduleApp;
