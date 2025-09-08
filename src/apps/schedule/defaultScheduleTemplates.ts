import { ScheduleTemplate } from './types';

export const defaultScheduleTemplates: ScheduleTemplate[] = [
    {
        name: 'Early Bird Productive',
        description: 'For early risers who want to maximize morning productivity',
        startTime: '05:00',
        blocks: [
            {
                startTime: '05:00',
                endTime: '05:30',
                activity: 'Wake Up & Ready',
                description: 'Morning routine: brush teeth, wash face, get dressed, prepare for the day',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '05:30',
                endTime: '06:30',
                activity: 'Morning Exercise',
                description: 'Workout routine, stretching, or light cardio to energize the body',
                category: 'health',
                color: '#667eea'
            },
            {
                startTime: '06:30',
                endTime: '07:30',
                activity: 'Breakfast & News',
                description: 'Healthy breakfast while catching up on news, emails, or planning the day',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '07:30',
                endTime: '08:30',
                activity: 'Skill Development',
                description: 'Learning new skills, reading, online courses, or personal development',
                category: 'personal',
                color: '#ed8936'
            },
            {
                startTime: '08:30',
                endTime: '12:00',
                activity: 'Deep Work Block 1',
                description: 'Most important work tasks, focused productivity time, no distractions',
                category: 'work',
                color: '#e53e3e'
            },
            {
                startTime: '12:00',
                endTime: '13:00',
                activity: 'Lunch Break',
                description: 'Nutritious lunch and short break to recharge',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '13:00',
                endTime: '17:00',
                activity: 'Work Block 2',
                description: 'Meetings, collaborative work, emails, and administrative tasks',
                category: 'work',
                color: '#e53e3e'
            },
            {
                startTime: '17:00',
                endTime: '18:00',
                activity: 'Personal Time',
                description: 'Hobbies, relaxation, family time, or personal errands',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '18:00',
                endTime: '19:00',
                activity: 'Dinner',
                description: 'Evening meal with family or friends, wind down from the day',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '19:00',
                endTime: '21:00',
                activity: 'Evening Activities',
                description: 'Light exercise, reading, entertainment, or social activities',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '21:00',
                endTime: '22:00',
                activity: 'Wind Down',
                description: 'Prepare for sleep: light stretching, meditation, or relaxing activities',
                category: 'personal',
                color: '#805ad5'
            }
        ]
    },
    {
        name: 'Standard 9-5 Schedule',
        description: 'Traditional work schedule with balanced lifestyle',
        startTime: '07:00',
        blocks: [
            {
                startTime: '07:00',
                endTime: '08:00',
                activity: 'Morning Routine',
                description: 'Wake up, shower, breakfast, and prepare for work',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '08:00',
                endTime: '09:00',
                activity: 'Commute & Setup',
                description: 'Travel to work or setup home office, review daily goals',
                category: 'work',
                color: '#e53e3e'
            },
            {
                startTime: '09:00',
                endTime: '12:30',
                activity: 'Morning Work',
                description: 'High-energy work tasks, meetings, and important projects',
                category: 'work',
                color: '#e53e3e'
            },
            {
                startTime: '12:30',
                endTime: '13:30',
                activity: 'Lunch Break',
                description: 'Lunch and midday break to recharge',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '13:30',
                endTime: '17:00',
                activity: 'Afternoon Work',
                description: 'Continued work, meetings, administrative tasks, and project completion',
                category: 'work',
                color: '#e53e3e'
            },
            {
                startTime: '17:00',
                endTime: '18:00',
                activity: 'Commute Home',
                description: 'Travel home or transition from work mode to personal time',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '18:00',
                endTime: '19:30',
                activity: 'Dinner & Family',
                description: 'Evening meal and quality time with family or friends',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '19:30',
                endTime: '21:00',
                activity: 'Personal Time',
                description: 'Hobbies, exercise, entertainment, or personal projects',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '21:00',
                endTime: '22:00',
                activity: 'Evening Routine',
                description: 'Prepare for tomorrow, relaxation, and wind down activities',
                category: 'personal',
                color: '#805ad5'
            }
        ]
    },
    {
        name: 'Student Schedule',
        description: 'Balanced schedule for students with study blocks and breaks',
        startTime: '07:30',
        blocks: [
            {
                startTime: '07:30',
                endTime: '08:30',
                activity: 'Morning Prep',
                description: 'Wake up, breakfast, and prepare for classes',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '08:30',
                endTime: '12:00',
                activity: 'Morning Classes',
                description: 'Attend lectures, seminars, or lab sessions',
                category: 'work',
                color: '#667eea'
            },
            {
                startTime: '12:00',
                endTime: '13:00',
                activity: 'Lunch Break',
                description: 'Lunch and social time with classmates',
                category: 'meal',
                color: '#f6ad55'
            },
            {
                startTime: '13:00',
                endTime: '15:00',
                activity: 'Study Session 1',
                description: 'Focused study time, homework, or assignment work',
                category: 'work',
                color: '#ed8936'
            },
            {
                startTime: '15:00',
                endTime: '15:30',
                activity: 'Break',
                description: 'Short break, snack, or quick walk',
                category: 'personal',
                color: '#48bb78'
            },
            {
                startTime: '15:30',
                endTime: '17:30',
                activity: 'Afternoon Classes',
                description: 'Additional lectures, tutorials, or group work',
                category: 'work',
                color: '#667eea'
            },
            {
                startTime: '17:30',
                endTime: '19:00',
                activity: 'Exercise & Dinner',
                description: 'Physical activity followed by dinner',
                category: 'health',
                color: '#38b2ac'
            },
            {
                startTime: '19:00',
                endTime: '21:00',
                activity: 'Study Session 2',
                description: 'Evening study, review notes, or project work',
                category: 'work',
                color: '#ed8936'
            },
            {
                startTime: '21:00',
                endTime: '22:30',
                activity: 'Personal Time',
                description: 'Social activities, hobbies, or relaxation',
                category: 'personal',
                color: '#805ad5'
            }
        ]
    }
];
