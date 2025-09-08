import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Exercise, WorkoutSchedule, ScheduleSection, ScheduleExercise } from '../types';
import { scheduleTemplates } from '../scheduleTemplates';

interface ScheduleCreatorProps {
    exercises: Exercise[];
    schedule?: WorkoutSchedule | null;
    onSaveSchedule: (schedule: Omit<WorkoutSchedule, 'id' | 'createdAt' | 'lastModified'>) => void;
    onCancel: () => void;
}

interface SortableExerciseItemProps {
    exercise: Exercise;
    scheduleExercise: ScheduleExercise;
    onUpdateExercise: (updates: Partial<ScheduleExercise>) => void;
    onRemove: () => void;
}

const SortableExerciseItem: React.FC<SortableExerciseItemProps> = ({
    exercise,
    scheduleExercise,
    onUpdateExercise,
    onRemove
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: scheduleExercise.exerciseId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`schedule-exercise-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="drag-handle" {...attributes} {...listeners}>
                ⋮⋮
            </div>

            <div className="exercise-content">
                <div className="exercise-info">
                    <h4>{exercise.name}</h4>
                    <p>{exercise.description}</p>
                </div>

                <div className="exercise-config">
                    <div className="config-field">
                        <label>Reps/Hold:</label>
                        <input
                            type="text"
                            value={scheduleExercise.customReps || exercise.repsOrHold}
                            onChange={(e) => onUpdateExercise({ customReps: e.target.value })}
                            placeholder={exercise.repsOrHold}
                        />
                    </div>

                    <div className="config-field">
                        <label>Notes:</label>
                        <input
                            type="text"
                            value={scheduleExercise.customNotes || ''}
                            onChange={(e) => onUpdateExercise({ customNotes: e.target.value })}
                            placeholder="Optional notes..."
                        />
                    </div>
                </div>

                <div className="exercise-meta">
                    <span className="exercise-time">{exercise.approxTimeMinutes}min</span>
                    <span className="exercise-category">{exercise.category}</span>
                </div>
            </div>

            <button onClick={onRemove} className="remove-exercise">
                ❌
            </button>
        </div>
    );
};

const ScheduleCreator: React.FC<ScheduleCreatorProps> = ({
    exercises,
    schedule,
    onSaveSchedule,
    onCancel
}) => {
    const [scheduleName, setScheduleName] = useState(schedule?.name || '');
    const [scheduleDescription, setScheduleDescription] = useState(schedule?.description || '');
    const [sections, setSections] = useState<ScheduleSection[]>(
        schedule?.sections || [
            {
                id: 'section_1',
                name: 'Main Workout',
                exercises: [],
                order: 0
            }
        ]
    );
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Calculate total estimated time
    const totalEstimatedMinutes = sections.reduce((total, section) => {
        return total + section.exercises.reduce((sectionTotal, scheduleExercise) => {
            const exercise = exercises.find(ex => ex.id === scheduleExercise.exerciseId);
            return sectionTotal + (exercise?.approxTimeMinutes || 0);
        }, 0);
    }, 0);

    // Filter exercises for selection
    const filteredExercises = exercises.filter(exercise => {
        const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
        const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Template loading function
    const loadTemplate = (templateName: string): void => {
        const template = scheduleTemplates.find(t => t.name === templateName);
        if (template) {
            setScheduleName(template.name);
            setScheduleDescription(template.description);

            // Convert template sections to schedule sections
            const newSections: ScheduleSection[] = template.sections.map((section, sectionIndex) => ({
                ...section,
                id: `section_${Date.now()}_${sectionIndex}`,
                exercises: section.exercises.map((ex, exIndex) => ({
                    ...ex,
                    order: exIndex
                }))
            }));

            setSections(newSections);
        }
    };

    const addSection = () => {
        const newSection: ScheduleSection = {
            id: `section_${Date.now()}`,
            name: `Section ${sections.length + 1}`,
            exercises: [],
            order: sections.length
        };
        setSections(prev => [...prev, newSection]);
    };

    const removeSection = (sectionId: string) => {
        if (sections.length <= 1) {
            alert('You must have at least one section');
            return;
        }
        setSections(prev => prev.filter(section => section.id !== sectionId));
    };

    const updateSectionName = (sectionId: string, name: string) => {
        setSections(prev => prev.map(section =>
            section.id === sectionId ? { ...section, name } : section
        ));
    };

    const addExerciseToSection = (sectionId: string, exerciseId: string) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                const newExercise: ScheduleExercise = {
                    exerciseId,
                    order: section.exercises.length,
                    customReps: undefined,
                    customNotes: undefined
                };
                return {
                    ...section,
                    exercises: [...section.exercises, newExercise]
                };
            }
            return section;
        }));
    };

    const removeExerciseFromSection = (sectionId: string, exerciseIndex: number) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    exercises: section.exercises.filter((_, index) => index !== exerciseIndex)
                };
            }
            return section;
        }));
    };

    const updateExerciseInSection = (
        sectionId: string,
        exerciseIndex: number,
        updates: Partial<ScheduleExercise>
    ) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    exercises: section.exercises.map((ex, index) =>
                        index === exerciseIndex ? { ...ex, ...updates } : ex
                    )
                };
            }
            return section;
        }));
    };

    const handleDragEnd = (event: DragEndEvent, sectionId: string) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections(prev => prev.map(section => {
                if (section.id === sectionId) {
                    const oldIndex = section.exercises.findIndex(ex => ex.exerciseId === active.id);
                    const newIndex = section.exercises.findIndex(ex => ex.exerciseId === over.id);

                    return {
                        ...section,
                        exercises: arrayMove(section.exercises, oldIndex, newIndex)
                    };
                }
                return section;
            }));
        }
    };

    const handleSave = () => {
        if (!scheduleName.trim()) {
            alert('Please enter a schedule name');
            return;
        }

        if (sections.every(section => section.exercises.length === 0)) {
            alert('Please add at least one exercise to your schedule');
            return;
        }

        onSaveSchedule({
            name: scheduleName.trim(),
            description: scheduleDescription.trim(),
            sections: sections.map((section, index) => ({
                ...section,
                order: index,
                exercises: section.exercises.map((ex, exIndex) => ({
                    ...ex,
                    order: exIndex
                }))
            })),
            totalEstimatedMinutes
        });
    };

    const categoryOptions = ['all', 'stretch', 'balance', 'strength', 'core', 'custom'];
    const categoryIcons = {
        stretch: '🧘',
        balance: '⚖️',
        strength: '💪',
        core: '🎯',
        custom: '⭐'
    };

    return (
        <div className="schedule-creator">
            <div className="schedule-creator-header">
                <h2>{schedule ? 'Edit Schedule' : 'Create New Schedule'}</h2>
                <div className="schedule-basic-info">
                    <div className="form-group">
                        <label htmlFor="schedule-name">Schedule Name *</label>
                        <input
                            id="schedule-name"
                            type="text"
                            value={scheduleName}
                            onChange={(e) => setScheduleName(e.target.value)}
                            placeholder="e.g., Morning Routine, Full Body Workout"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="schedule-description">Description</label>
                        <textarea
                            id="schedule-description"
                            value={scheduleDescription}
                            onChange={(e) => setScheduleDescription(e.target.value)}
                            placeholder="Brief description of this workout schedule..."
                            rows={2}
                        />
                    </div>

                    <div className="template-loader">
                        <label>🎯 Load Exercise Template:</label>
                        <select onChange={(e) => e.target.value && loadTemplate(e.target.value)} value="">
                            <option value="">Choose a template...</option>
                            {scheduleTemplates.map(template => (
                                <option key={template.name} value={template.name}>
                                    {template.name} ({template.estimatedMinutes}min)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="schedule-stats">
                        <span className="stat">⏱️ {totalEstimatedMinutes} min total</span>
                        <span className="stat">📋 {sections.reduce((total, s) => total + s.exercises.length, 0)} exercises</span>
                        <span className="stat">📑 {sections.length} sections</span>
                    </div>
                </div>
            </div>

            <div className="schedule-creator-content">
                <div className="exercise-selector">
                    <h3>Available Exercises</h3>

                    <div className="exercise-filters">
                        <div className="filter-group">
                            <label>Category:</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">📋 All</option>
                                {categoryOptions.slice(1).map(category => (
                                    <option key={category} value={category}>
                                        {categoryIcons[category as keyof typeof categoryIcons]} {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Search:</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search exercises..."
                            />
                        </div>
                    </div>

                    <div className="exercise-list">
                        {filteredExercises.map(exercise => (
                            <div key={exercise.id} className="exercise-option">
                                <div className="exercise-option-info">
                                    <h4>{exercise.name}</h4>
                                    <p>{exercise.description}</p>
                                    <div className="exercise-option-meta">
                                        <span>{exercise.repsOrHold}</span>
                                        <span>{exercise.approxTimeMinutes}min</span>
                                        <span>{exercise.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="schedule-builder">
                    <div className="schedule-sections">
                        {sections.map((section, sectionIndex) => (
                            <div key={section.id} className="schedule-section">
                                <div className="section-header">
                                    <input
                                        type="text"
                                        value={section.name}
                                        onChange={(e) => updateSectionName(section.id, e.target.value)}
                                        placeholder={`Section ${sectionIndex + 1}`}
                                        className="section-name-input"
                                    />

                                    <div className="section-actions">
                                        <button
                                            onClick={() => removeSection(section.id)}
                                            className="remove-section"
                                            disabled={sections.length <= 1}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="section-drop-zone">
                                    {section.exercises.length === 0 ? (
                                        <div className="empty-section">
                                            <p>Drag exercises here or click + to add</p>
                                            <div className="add-exercise-buttons">
                                                {filteredExercises.slice(0, 3).map(exercise => (
                                                    <button
                                                        key={exercise.id}
                                                        onClick={() => addExerciseToSection(section.id, exercise.id)}
                                                        className="quick-add-exercise"
                                                    >
                                                        + {exercise.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={(event) => handleDragEnd(event, section.id)}
                                        >
                                            <SortableContext
                                                items={section.exercises.map(ex => ex.exerciseId)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {section.exercises.map((scheduleExercise, exerciseIndex) => {
                                                    const exercise = exercises.find(ex => ex.id === scheduleExercise.exerciseId);
                                                    if (!exercise) return null;

                                                    return (
                                                        <SortableExerciseItem
                                                            key={scheduleExercise.exerciseId}
                                                            exercise={exercise}
                                                            scheduleExercise={scheduleExercise}
                                                            onUpdateExercise={(updates) =>
                                                                updateExerciseInSection(section.id, exerciseIndex, updates)
                                                            }
                                                            onRemove={() => removeExerciseFromSection(section.id, exerciseIndex)}
                                                        />
                                                    );
                                                })}
                                            </SortableContext>
                                        </DndContext>
                                    )}
                                </div>

                                <div className="section-add-exercise">
                                    <select
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                addExerciseToSection(section.id, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                        value=""
                                    >
                                        <option value="">+ Add exercise to this section</option>
                                        {filteredExercises.map(exercise => (
                                            <option key={exercise.id} value={exercise.id}>
                                                {exercise.name} ({exercise.approxTimeMinutes}min)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}

                        <button onClick={addSection} className="add-section-button">
                            ➕ Add Section
                        </button>
                    </div>
                </div>
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
