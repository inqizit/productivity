import React, { useState } from 'react';
import { DailySchedule, TimeBlock } from '../types';
import { defaultScheduleTemplates } from '../defaultScheduleTemplates';

interface ScheduleCreatorProps {
    schedule?: DailySchedule | null;
    onSaveSchedule: (schedule: Omit<DailySchedule, 'id' | 'createdAt' | 'lastModified' | 'isDefault'>) => void;
    onCancel: () => void;
}

const ScheduleCreator: React.FC<ScheduleCreatorProps> = ({
    schedule,
    onSaveSchedule,
    onCancel
}) => {
    const [scheduleName, setScheduleName] = useState(schedule?.name || '');
    const [scheduleDescription, setScheduleDescription] = useState(schedule?.description || '');
    const [startTime, setStartTime] = useState(schedule?.startTime || '07:00');
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(schedule?.timeBlocks || []);

    // Calculate end time based on last time block
    const endTime = timeBlocks.length > 0
        ? timeBlocks[timeBlocks.length - 1].endTime
        : startTime;

    const categoryColors = {
        work: '#e53e3e',
        personal: '#48bb78',
        health: '#667eea',
        meal: '#f6ad55',
        sleep: '#805ad5',
        custom: '#718096'
    };

    const addTimeBlock = (): void => {
        const lastBlock = timeBlocks[timeBlocks.length - 1];
        const newStartTime = lastBlock ? lastBlock.endTime : startTime;

        // Calculate 30 minutes later
        const [hours, minutes] = newStartTime.split(':').map(Number);
        const newEndTime = new Date(2024, 0, 1, hours, minutes + 30);
        const endTimeString = `${newEndTime.getHours().toString().padStart(2, '0')}:${newEndTime.getMinutes().toString().padStart(2, '0')}`;

        const newBlock: TimeBlock = {
            id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            startTime: newStartTime,
            endTime: endTimeString,
            activity: '',
            description: '',
            category: 'custom',
            color: categoryColors.custom
        };

        setTimeBlocks(prev => [...prev, newBlock]);
    };

    const updateTimeBlock = (id: string, updates: Partial<TimeBlock>): void => {
        setTimeBlocks(prev => prev.map(block =>
            block.id === id ? { ...block, ...updates } : block
        ));
    };

    const removeTimeBlock = (id: string): void => {
        setTimeBlocks(prev => prev.filter(block => block.id !== id));
    };

    const updateBlockCategory = (id: string, category: string): void => {
        const color = categoryColors[category as keyof typeof categoryColors] || categoryColors.custom;
        updateTimeBlock(id, { category: category as any, color });
    };

    const loadTemplate = (templateName: string): void => {
        const template = defaultScheduleTemplates.find(t => t.name === templateName);
        if (template) {
            setScheduleName(template.name);
            setScheduleDescription(template.description);
            setStartTime(template.startTime);

            const newTimeBlocks: TimeBlock[] = template.blocks.map((block, index) => ({
                ...block,
                id: `block_${Date.now()}_${index}`
            }));

            setTimeBlocks(newTimeBlocks);
        }
    };

    const handleSave = (): void => {
        if (!scheduleName.trim()) {
            alert('Please enter a schedule name');
            return;
        }

        if (timeBlocks.length === 0) {
            alert('Please add at least one time block');
            return;
        }

        onSaveSchedule({
            name: scheduleName.trim(),
            description: scheduleDescription.trim(),
            timeBlocks,
            startTime,
            endTime
        });
    };

    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div className="schedule-creator">
            <div className="schedule-creator-header">
                <h2>{schedule ? 'Edit Schedule' : 'Create New Schedule'}</h2>

                <div className="schedule-basic-info">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="schedule-name">Schedule Name *</label>
                            <input
                                id="schedule-name"
                                type="text"
                                value={scheduleName}
                                onChange={(e) => setScheduleName(e.target.value)}
                                placeholder="e.g., My Daily Routine"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="start-time">Start Time *</label>
                            <input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="schedule-description">Description</label>
                        <textarea
                            id="schedule-description"
                            value={scheduleDescription}
                            onChange={(e) => setScheduleDescription(e.target.value)}
                            placeholder="Brief description of this schedule..."
                            rows={2}
                        />
                    </div>

                    <div className="template-loader">
                        <label>Load Template:</label>
                        <select onChange={(e) => e.target.value && loadTemplate(e.target.value)} value="">
                            <option value="">Choose a template...</option>
                            {defaultScheduleTemplates.map(template => (
                                <option key={template.name} value={template.name}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="schedule-stats">
                        <span className="stat">⏰ {formatTime(startTime)} → {formatTime(endTime)}</span>
                        <span className="stat">📋 {timeBlocks.length} time blocks</span>
                    </div>
                </div>
            </div>

            <div className="time-blocks-section">
                <div className="section-header">
                    <h3>Time Blocks</h3>
                    <button onClick={addTimeBlock} className="add-block-button">
                        ➕ Add 30min Block
                    </button>
                </div>

                <div className="time-blocks-list">
                    {timeBlocks.map((block, index) => (
                        <div key={block.id} className="time-block-item">
                            <div className="block-time">
                                <span className="block-number">{index + 1}</span>
                                <div className="time-range">
                                    <input
                                        type="time"
                                        value={block.startTime}
                                        onChange={(e) => updateTimeBlock(block.id, { startTime: e.target.value })}
                                    />
                                    <span>→</span>
                                    <input
                                        type="time"
                                        value={block.endTime}
                                        onChange={(e) => updateTimeBlock(block.id, { endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="block-content">
                                <div className="block-main-info">
                                    <input
                                        type="text"
                                        value={block.activity}
                                        onChange={(e) => updateTimeBlock(block.id, { activity: e.target.value })}
                                        placeholder="Activity name (short)"
                                        className="activity-input"
                                    />

                                    <select
                                        value={block.category || 'custom'}
                                        onChange={(e) => updateBlockCategory(block.id, e.target.value)}
                                        className="category-select"
                                    >
                                        <option value="work">🔴 Work</option>
                                        <option value="personal">🟢 Personal</option>
                                        <option value="health">🔵 Health</option>
                                        <option value="meal">🟡 Meal</option>
                                        <option value="sleep">🟣 Sleep</option>
                                        <option value="custom">⚫ Custom</option>
                                    </select>
                                </div>

                                <textarea
                                    value={block.description}
                                    onChange={(e) => updateTimeBlock(block.id, { description: e.target.value })}
                                    placeholder="Detailed description (shown on hover/long press)"
                                    className="description-input"
                                    rows={2}
                                />
                            </div>

                            <div
                                className="color-indicator"
                                style={{ backgroundColor: block.color }}
                            />

                            <button
                                onClick={() => removeTimeBlock(block.id)}
                                className="remove-block-button"
                                title="Remove this time block"
                            >
                                ❌
                            </button>
                        </div>
                    ))}
                </div>

                {timeBlocks.length === 0 && (
                    <div className="empty-blocks">
                        <p>No time blocks yet. Add your first block to get started!</p>
                        <button onClick={addTimeBlock} className="add-first-block-button">
                            ➕ Add First Time Block
                        </button>
                    </div>
                )}
            </div>

            <div className="schedule-creator-actions">
                <button onClick={onCancel} className="cancel-button">
                    Cancel
                </button>
                <button onClick={handleSave} className="save-schedule-button">
                    {schedule ? 'Update Schedule' : 'Save Schedule'}
                </button>
            </div>
        </div>
    );
};

export default ScheduleCreator;
