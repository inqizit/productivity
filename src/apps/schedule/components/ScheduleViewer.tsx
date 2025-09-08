import React, { useState } from 'react';
import { DailySchedule, TimeBlock } from '../types';

interface ScheduleViewerProps {
    schedule: DailySchedule;
    onEdit: () => void;
    onBack: () => void;
}

const ScheduleViewer: React.FC<ScheduleViewerProps> = ({
    schedule,
    onEdit,
    onBack
}) => {
    const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
    const [pressedBlock, setPressedBlock] = useState<string | null>(null);

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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBlockDuration = (block: TimeBlock): string => {
        const start = new Date(`2024-01-01T${block.startTime}`);
        const end = new Date(`2024-01-01T${block.endTime}`);
        const diffMs = end.getTime() - start.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes}min`;
        } else {
            const hours = Math.floor(diffMinutes / 60);
            const remainingMinutes = diffMinutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
        }
    };

    const handleBlockPress = (blockId: string): void => {
        setPressedBlock(blockId);
        // Auto-hide after 3 seconds
        setTimeout(() => {
            setPressedBlock(null);
        }, 3000);
    };

    const shouldShowDescription = (blockId: string): boolean => {
        return hoveredBlock === blockId || pressedBlock === blockId;
    };

    return (
        <div className="schedule-viewer">
            <div className="schedule-viewer-header">
                <button onClick={onBack} className="back-button">
                    ← Back to Schedules
                </button>

                <div className="schedule-header-info">
                    <h1>{schedule.name}</h1>
                    <p>{schedule.description}</p>

                    <div className="schedule-overview">
                        <div className="overview-item">
                            <span className="label">Duration:</span>
                            <span className="value">{formatTime(schedule.startTime)} → {formatTime(schedule.endTime)}</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">Time Blocks:</span>
                            <span className="value">{schedule.timeBlocks.length} activities</span>
                        </div>
                        <div className="overview-item">
                            <span className="label">Created:</span>
                            <span className="value">{formatDate(schedule.createdAt)}</span>
                        </div>
                    </div>
                </div>

                <button onClick={onEdit} className="edit-schedule-button">
                    ✏️ Edit Schedule
                </button>
            </div>

            <div className="timeline-container">
                <h2>Daily Timeline</h2>
                <p className="timeline-help">
                    💡 Hover over activities to see details, or tap on mobile for description
                </p>

                <div className="timeline">
                    {schedule.timeBlocks.map((block, index) => (
                        <div
                            key={block.id}
                            className="timeline-block"
                            style={{
                                borderLeftColor: block.color,
                                backgroundColor: shouldShowDescription(block.id) ? `${block.color}15` : 'transparent'
                            }}
                            onMouseEnter={() => setHoveredBlock(block.id)}
                            onMouseLeave={() => setHoveredBlock(null)}
                            onClick={() => handleBlockPress(block.id)}
                            onTouchStart={() => handleBlockPress(block.id)}
                        >
                            <div className="timeline-time">
                                <span className="start-time">{formatTime(block.startTime)}</span>
                                <span className="duration">({getBlockDuration(block)})</span>
                            </div>

                            <div className="timeline-content">
                                <div className="activity-header">
                                    <h3 className="activity-name">{block.activity}</h3>
                                    <span
                                        className="category-badge"
                                        style={{ backgroundColor: block.color }}
                                    >
                                        {block.category}
                                    </span>
                                </div>

                                {shouldShowDescription(block.id) && block.description && (
                                    <div className="activity-description">
                                        <p>{block.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="timeline-connector">
                                {index < schedule.timeBlocks.length - 1 && (
                                    <div className="connector-line" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="schedule-summary">
                <h3>Schedule Summary</h3>
                <div className="summary-grid">
                    <div className="summary-category">
                        <h4>🔴 Work Activities</h4>
                        <ul>
                            {schedule.timeBlocks
                                .filter(block => block.category === 'work')
                                .map(block => (
                                    <li key={block.id}>
                                        {formatTime(block.startTime)} - {block.activity}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="summary-category">
                        <h4>🟢 Personal Activities</h4>
                        <ul>
                            {schedule.timeBlocks
                                .filter(block => block.category === 'personal')
                                .map(block => (
                                    <li key={block.id}>
                                        {formatTime(block.startTime)} - {block.activity}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="summary-category">
                        <h4>🔵 Health Activities</h4>
                        <ul>
                            {schedule.timeBlocks
                                .filter(block => block.category === 'health')
                                .map(block => (
                                    <li key={block.id}>
                                        {formatTime(block.startTime)} - {block.activity}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>

                    <div className="summary-category">
                        <h4>🟡 Meals</h4>
                        <ul>
                            {schedule.timeBlocks
                                .filter(block => block.category === 'meal')
                                .map(block => (
                                    <li key={block.id}>
                                        {formatTime(block.startTime)} - {block.activity}
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleViewer;
