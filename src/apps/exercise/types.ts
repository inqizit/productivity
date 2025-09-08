// Exercise and Schedule Types
export interface Exercise {
    id: string;
    name: string;
    description: string;
    musclesTargeted: string[];
    approxTimeMinutes: number;
    detailedSteps: string[];
    repsOrHold: string;
    category: 'stretch' | 'balance' | 'strength' | 'core' | 'custom';
    isDefault: boolean;
}

export interface ScheduleExercise {
    exerciseId: string;
    order: number;
    customReps?: string; // Override default reps/hold
    customNotes?: string;
}

export interface ScheduleSection {
    id: string;
    name: string;
    exercises: ScheduleExercise[];
    order: number;
}

export interface WorkoutSchedule {
    id: string;
    name: string;
    description: string;
    sections: ScheduleSection[];
    totalEstimatedMinutes: number;
    createdAt: string;
    lastModified: string;
}

export type ViewMode = 'exercises' | 'schedules' | 'create-schedule';
