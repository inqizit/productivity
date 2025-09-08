// Daily Schedule Management Types

export interface TimeBlock {
    id: string;
    startTime: string; // Format: "HH:MM" (24-hour)
    endTime: string;   // Format: "HH:MM" (24-hour)
    activity: string;  // Short name (visible directly)
    description: string; // Detailed description (shown on long press/hover)
    category?: 'work' | 'personal' | 'health' | 'meal' | 'sleep' | 'custom';
    color?: string;
}

export interface DailySchedule {
    id: string;
    name: string;
    description: string;
    timeBlocks: TimeBlock[];
    startTime: string; // Wake up time, format: "HH:MM"
    endTime: string;   // Sleep time, format: "HH:MM"
    createdAt: string;
    lastModified: string;
    isDefault: boolean;
}

export type ViewMode = 'schedules' | 'create-schedule' | 'view-schedule';

export interface ScheduleTemplate {
    name: string;
    description: string;
    startTime: string;
    blocks: Omit<TimeBlock, 'id'>[];
}
