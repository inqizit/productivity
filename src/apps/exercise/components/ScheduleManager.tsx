import React, { useState } from 'react';
import { WorkoutSchedule, Exercise } from '../types';

interface ScheduleManagerProps {
    schedules: WorkoutSchedule[];
    exercises: Exercise[];
    onDeleteSchedule: (id: string) => void;
    onEditSchedule: (schedule: WorkoutSchedule) => void;
    onResetToDefaults: () => void;
    onAddNewDefaults: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
    schedules,
    exercises,
    onDeleteSchedule,
    onEditSchedule,
    onResetToDefaults,
    onAddNewDefaults
}) => {
    const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

    const getExerciseById = (id: string): Exercise | undefined => {
        return exercises.find(ex => ex.id === id);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ScheduleDetail: React.FC<{ schedule: WorkoutSchedule }> = ({ schedule }) => {
        return (
            <div className="schedule-detail">
                <div className="schedule-header">
                    <h3>{schedule.name}</h3>
                    <div className="schedule-meta">
                        <span className="schedule-time">⏱️ {schedule.totalEstimatedMinutes} min</span>
                        <span className="schedule-exercises">
                            📋 {schedule.sections.reduce((total, section) => total + section.exercises.length, 0)} exercises
                        </span>
                    </div>
                </div>

                {schedule.description && (
                    <p className="schedule-description">{schedule.description}</p>
                )}

                <div className="schedule-sections">
                    {schedule.sections.map((section) => (
                        <div key={section.id} className="schedule-section">
                            <h4 className="section-name">
                                {section.name || `Section ${section.order + 1}`}
                            </h4>

                            <div className="section-exercises">
                                {section.exercises.map((scheduleExercise, index) => {
                                    const exercise = getExerciseById(scheduleExercise.exerciseId);
                                    if (!exercise) return null;

                                    return (
                                        <div key={index} className="schedule-exercise-item">
                                            <div className="exercise-order">{index + 1}</div>
                                            <div className="exercise-info">
                                                <div className="exercise-name">{exercise.name}</div>
                                                <div className="exercise-reps">
                                                    {scheduleExercise.customReps || exercise.repsOrHold}
                                                </div>
                                                {scheduleExercise.customNotes && (
                                                    <div className="exercise-notes">{scheduleExercise.customNotes}</div>
                                                )}
                                            </div>
                                            <div className="exercise-time">{exercise.approxTimeMinutes}min</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="schedule-actions">
                    <button
                        onClick={() => onEditSchedule(schedule)}
                        className="edit-schedule-button"
                    >
                        ✏️ Edit Schedule
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm(`Delete schedule "${schedule.name}"?`)) {
                                onDeleteSchedule(schedule.id);
                                if (selectedSchedule === schedule.id) {
                                    setSelectedSchedule(null);
                                }
                            }
                        }}
                        className="delete-schedule-button"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="schedule-manager">
            <div className="schedule-manager-header">
                <div>
                    <h2>📅 Workout Schedules</h2>
                    <p>Manage your custom workout routines</p>
                </div>
                <div className="schedule-header-buttons">
                    <button
                        onClick={onAddNewDefaults}
                        className="add-defaults-button"
                        title="Add new default schedules (keeps existing ones)"
                    >
                        ➕ Add New Defaults
                    </button>
                    <button
                        onClick={onResetToDefaults}
                        className="reset-schedules-button"
                        title="Reset to default schedules (removes all existing)"
                    >
                        🔄 Reset All
                    </button>
                </div>
            </div>

            {schedules.length === 0 ? (
                <div className="empty-schedules">
                    <div className="empty-state">
                        <h3>No schedules created yet</h3>
                        <p>Create your first workout schedule to get started!</p>
                    </div>
                </div>
            ) : (
                <div className="schedules-layout">
                    <div className="schedules-list">
                        <h3>Your Schedules ({schedules.length})</h3>
                        {schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className={`schedule-item ${selectedSchedule === schedule.id ? 'active' : ''}`}
                                onClick={() => setSelectedSchedule(
                                    selectedSchedule === schedule.id ? null : schedule.id
                                )}
                            >
                                <div className="schedule-item-header">
                                    <h4>{schedule.name}</h4>
                                    <span className="schedule-duration">{schedule.totalEstimatedMinutes}min</span>
                                </div>

                                <div className="schedule-item-details">
                                    <span className="exercise-count">
                                        {schedule.sections.reduce((total, section) => total + section.exercises.length, 0)} exercises
                                    </span>
                                    <span className="section-count">
                                        {schedule.sections.length} sections
                                    </span>
                                </div>

                                <div className="schedule-item-dates">
                                    <div className="date-info">
                                        <span>Created: {formatDate(schedule.createdAt)}</span>
                                    </div>
                                    {schedule.lastModified !== schedule.createdAt && (
                                        <div className="date-info">
                                            <span>Modified: {formatDate(schedule.lastModified)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="schedule-quick-actions">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditSchedule(schedule);
                                        }}
                                        className="quick-edit-button"
                                        title="Edit Schedule"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm(`Delete schedule "${schedule.name}"?`)) {
                                                onDeleteSchedule(schedule.id);
                                                if (selectedSchedule === schedule.id) {
                                                    setSelectedSchedule(null);
                                                }
                                            }
                                        }}
                                        className="quick-delete-button"
                                        title="Delete Schedule"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="schedule-detail-panel">
                        {selectedSchedule ? (
                            <ScheduleDetail
                                schedule={schedules.find(s => s.id === selectedSchedule)!}
                            />
                        ) : (
                            <div className="no-selection">
                                <h3>Select a schedule to view details</h3>
                                <p>Click on a schedule from the list to see its exercises and sections.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleManager;
