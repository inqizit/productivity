import React, { useState } from 'react';
import { DailySchedule } from '../types';

interface ScheduleManagerProps {
    schedules: DailySchedule[];
    onDeleteSchedule: (id: string) => void;
    onEditSchedule: (schedule: DailySchedule) => void;
    onViewSchedule: (schedule: DailySchedule) => void;
    onResetToDefaults: () => void;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
    schedules,
    onDeleteSchedule,
    onEditSchedule,
    onViewSchedule,
    onResetToDefaults
}) => {
    const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
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

    const getScheduleDuration = (schedule: DailySchedule): string => {
        const startTime = new Date(`2024-01-01T${schedule.startTime}`);
        const endTime = new Date(`2024-01-01T${schedule.endTime}`);
        const diffMs = endTime.getTime() - startTime.getTime();
        const diffHours = Math.round(diffMs / (1000 * 60 * 60));
        return `${diffHours}h`;
    };

    return (
        <div className="schedule-manager">
            <div className="schedule-manager-header">
                <div>
                    <h2>📅 Daily Schedules</h2>
                    <p>Manage your time-blocked daily schedules</p>
                </div>
                <button
                    onClick={onResetToDefaults}
                    className="reset-schedules-button"
                    title="Reset to default schedule templates"
                >
                    🔄 Reset to Defaults
                </button>
            </div>

            {schedules.length === 0 ? (
                <div className="empty-schedules">
                    <div className="empty-state">
                        <h3>No schedules created yet</h3>
                        <p>Create your first daily schedule to get started!</p>
                    </div>
                </div>
            ) : (
                <div className="schedules-grid">
                    {schedules.map((schedule) => (
                        <div
                            key={schedule.id}
                            className="schedule-card"
                        >
                            <div className="schedule-card-header">
                                <h3>{schedule.name}</h3>
                                <div className="schedule-badges">
                                    {schedule.isDefault && (
                                        <span className="default-badge">Default</span>
                                    )}
                                    <span className="duration-badge">
                                        {getScheduleDuration(schedule)}
                                    </span>
                                </div>
                            </div>

                            <p className="schedule-description">{schedule.description}</p>

                            <div className="schedule-time-info">
                                <div className="time-range">
                                    <span className="start-time">{formatTime(schedule.startTime)}</span>
                                    <span className="time-separator">→</span>
                                    <span className="end-time">{formatTime(schedule.endTime)}</span>
                                </div>
                                <div className="block-count">
                                    {schedule.timeBlocks.length} time blocks
                                </div>
                            </div>

                            <div className="schedule-preview">
                                <h4>Activities Preview:</h4>
                                <div className="activity-list">
                                    {schedule.timeBlocks.slice(0, 3).map((block, index) => (
                                        <div key={index} className="activity-preview">
                                            <span className="activity-time">{formatTime(block.startTime)}</span>
                                            <span className="activity-name">{block.activity}</span>
                                        </div>
                                    ))}
                                    {schedule.timeBlocks.length > 3 && (
                                        <div className="more-activities">
                                            +{schedule.timeBlocks.length - 3} more activities
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="schedule-meta">
                                <div className="date-info">
                                    <span>Created: {formatDate(schedule.createdAt)}</span>
                                    {schedule.lastModified !== schedule.createdAt && (
                                        <span>Modified: {formatDate(schedule.lastModified)}</span>
                                    )}
                                </div>
                            </div>

                            <div className="schedule-actions">
                                <button
                                    onClick={() => onViewSchedule(schedule)}
                                    className="view-button"
                                >
                                    👁️ View
                                </button>
                                <button
                                    onClick={() => onEditSchedule(schedule)}
                                    className="edit-button"
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Delete schedule "${schedule.name}"?`)) {
                                            onDeleteSchedule(schedule.id);
                                        }
                                    }}
                                    className="delete-button"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScheduleManager;
