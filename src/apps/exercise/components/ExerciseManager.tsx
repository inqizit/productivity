import React, { useState } from 'react';
import { Exercise } from '../types';

interface ExerciseManagerProps {
    exercises: Exercise[];
    onAddExercise: (exercise: Omit<Exercise, 'id' | 'isDefault'>) => void;
    onUpdateExercise: (id: string, updates: Partial<Exercise>) => void;
    onDeleteExercise: (id: string) => void;
    onResetToDefaults: () => void;
}

const ExerciseManager: React.FC<ExerciseManagerProps> = ({
    exercises,
    onAddExercise,
    onUpdateExercise,
    onDeleteExercise,
    onResetToDefaults
}) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categoryFilters = ['all', 'stretch', 'balance', 'strength', 'core', 'custom'];
    const categoryIcons = {
        stretch: '🧘',
        balance: '⚖️',
        strength: '💪',
        core: '🎯',
        custom: '⭐'
    };

    const filteredExercises = exercises.filter(exercise =>
        selectedCategory === 'all' || exercise.category === selectedCategory
    );

    const ExerciseForm: React.FC<{
        exercise?: Exercise;
        onSubmit: (exercise: Omit<Exercise, 'id' | 'isDefault'>) => void;
        onCancel: () => void;
    }> = ({ exercise, onSubmit, onCancel }) => {
        const [formData, setFormData] = useState({
            name: exercise?.name || '',
            description: exercise?.description || '',
            musclesTargeted: exercise?.musclesTargeted || [],
            approxTimeMinutes: exercise?.approxTimeMinutes || 1,
            detailedSteps: exercise?.detailedSteps || [''],
            repsOrHold: exercise?.repsOrHold || '',
            category: exercise?.category || 'custom' as const
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!formData.name.trim()) return;

            onSubmit({
                ...formData,
                musclesTargeted: formData.musclesTargeted.filter(m => m.trim()),
                detailedSteps: formData.detailedSteps.filter(s => s.trim())
            });
        };

        const addStep = () => {
            setFormData(prev => ({
                ...prev,
                detailedSteps: [...prev.detailedSteps, '']
            }));
        };

        const removeStep = (index: number) => {
            setFormData(prev => ({
                ...prev,
                detailedSteps: prev.detailedSteps.filter((_, i) => i !== index)
            }));
        };

        const updateStep = (index: number, value: string) => {
            setFormData(prev => ({
                ...prev,
                detailedSteps: prev.detailedSteps.map((step, i) => i === index ? value : step)
            }));
        };

        const addMuscle = () => {
            setFormData(prev => ({
                ...prev,
                musclesTargeted: [...prev.musclesTargeted, '']
            }));
        };

        const removeMuscle = (index: number) => {
            setFormData(prev => ({
                ...prev,
                musclesTargeted: prev.musclesTargeted.filter((_, i) => i !== index)
            }));
        };

        const updateMuscle = (index: number, value: string) => {
            setFormData(prev => ({
                ...prev,
                musclesTargeted: prev.musclesTargeted.map((muscle, i) => i === index ? value : muscle)
            }));
        };

        return (
            <div className="exercise-form-overlay">
                <form className="exercise-form" onSubmit={handleSubmit}>
                    <h3>{exercise ? 'Edit Exercise' : 'Add New Exercise'}</h3>

                    <div className="form-group">
                        <label htmlFor="name">Exercise Name *</label>
                        <input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        >
                            <option value="stretch">🧘 Stretch</option>
                            <option value="balance">⚖️ Balance</option>
                            <option value="strength">💪 Strength</option>
                            <option value="core">🎯 Core</option>
                            <option value="custom">⭐ Custom</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="time">Time (minutes)</label>
                            <input
                                id="time"
                                type="number"
                                min="1"
                                max="120"
                                value={formData.approxTimeMinutes}
                                onChange={(e) => setFormData(prev => ({ ...prev, approxTimeMinutes: parseInt(e.target.value) || 1 }))}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="reps">Reps/Hold Instructions</label>
                            <input
                                id="reps"
                                type="text"
                                value={formData.repsOrHold}
                                onChange={(e) => setFormData(prev => ({ ...prev, repsOrHold: e.target.value }))}
                                placeholder="e.g., 3×15 reps, 30 sec hold"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Muscles Targeted</label>
                        {formData.musclesTargeted.map((muscle, index) => (
                            <div key={index} className="input-row">
                                <input
                                    type="text"
                                    value={muscle}
                                    onChange={(e) => updateMuscle(index, e.target.value)}
                                    placeholder="Muscle group"
                                />
                                <button type="button" onClick={() => removeMuscle(index)}>❌</button>
                            </div>
                        ))}
                        <button type="button" onClick={addMuscle} className="add-button">+ Add Muscle</button>
                    </div>

                    <div className="form-group">
                        <label>Detailed Steps</label>
                        {formData.detailedSteps.map((step, index) => (
                            <div key={index} className="input-row">
                                <span className="step-number">{index + 1}.</span>
                                <textarea
                                    value={step}
                                    onChange={(e) => updateStep(index, e.target.value)}
                                    placeholder="Step description"
                                    rows={2}
                                />
                                <button type="button" onClick={() => removeStep(index)}>❌</button>
                            </div>
                        ))}
                        <button type="button" onClick={addStep} className="add-button">+ Add Step</button>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
                        <button type="submit" className="save-button">
                            {exercise ? 'Update Exercise' : 'Add Exercise'}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    const handleEdit = (exercise: Exercise) => {
        setEditingExercise(exercise);
    };

    const handleUpdate = (updatedExercise: Omit<Exercise, 'id' | 'isDefault'>) => {
        if (editingExercise) {
            onUpdateExercise(editingExercise.id, updatedExercise);
            setEditingExercise(null);
        }
    };

    return (
        <div className="exercise-manager">
            <div className="exercise-controls">
                <div className="filter-controls">
                    <label>Filter by category:</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">📋 All Categories</option>
                        {categoryFilters.slice(1).map(category => (
                            <option key={category} value={category}>
                                {category === 'custom' ? '⭐' : categoryIcons[category as keyof typeof categoryIcons]} {category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="action-controls">
                    <button onClick={() => setShowAddForm(true)} className="add-exercise-button">
                        ➕ Add Exercise
                    </button>
                    <button onClick={onResetToDefaults} className="reset-button">
                        🔄 Reset to Defaults
                    </button>
                </div>
            </div>

            <div className="exercise-stats">
                <div className="stat-card">
                    <span className="stat-number">{exercises.length}</span>
                    <span className="stat-label">Total Exercises</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{exercises.filter(e => !e.isDefault).length}</span>
                    <span className="stat-label">Custom</span>
                </div>
                <div className="stat-card">
                    <span className="stat-number">{Math.round(exercises.reduce((sum, e) => sum + e.approxTimeMinutes, 0))}</span>
                    <span className="stat-label">Total Minutes</span>
                </div>
            </div>

            <div className="exercises-grid">
                {filteredExercises.map((exercise) => (
                    <div key={exercise.id} className="exercise-card">
                        <div className="exercise-header">
                            <div className="exercise-category">
                                {categoryIcons[exercise.category as keyof typeof categoryIcons]} {exercise.category}
                            </div>
                            <div className="exercise-time">{exercise.approxTimeMinutes}min</div>
                        </div>

                        <h3 className="exercise-name">{exercise.name}</h3>
                        <p className="exercise-description">{exercise.description}</p>

                        <div className="exercise-details">
                            <div className="exercise-reps">
                                <strong>Reps/Hold:</strong> {exercise.repsOrHold}
                            </div>
                            <div className="exercise-muscles">
                                <strong>Targets:</strong> {exercise.musclesTargeted.join(', ')}
                            </div>
                        </div>

                        <div className="exercise-steps">
                            <strong>Steps:</strong>
                            <ol>
                                {exercise.detailedSteps.map((step, index) => (
                                    <li key={index}>{step}</li>
                                ))}
                            </ol>
                        </div>

                        <div className="exercise-actions">
                            <button onClick={() => handleEdit(exercise)} className="edit-button">
                                ✏️ Edit
                            </button>
                            {!exercise.isDefault && (
                                <button
                                    onClick={() => onDeleteExercise(exercise.id)}
                                    className="delete-button"
                                >
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {filteredExercises.length === 0 && (
                <div className="empty-state">
                    <p>No exercises found in this category.</p>
                    <button onClick={() => setShowAddForm(true)} className="add-exercise-button">
                        ➕ Add Your First Exercise
                    </button>
                </div>
            )}

            {showAddForm && (
                <ExerciseForm
                    onSubmit={(exercise) => {
                        onAddExercise(exercise);
                        setShowAddForm(false);
                    }}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {editingExercise && (
                <ExerciseForm
                    exercise={editingExercise}
                    onSubmit={handleUpdate}
                    onCancel={() => setEditingExercise(null)}
                />
            )}
        </div>
    );
};

export default ExerciseManager;
