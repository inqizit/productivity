import { WorkoutSchedule } from './types';

export interface ScheduleTemplate {
    name: string;
    description: string;
    sections: WorkoutSchedule['sections'];
    estimatedMinutes: number;
}

export const scheduleTemplates: ScheduleTemplate[] = [
    {
        name: '🌅 Comprehensive Morning Routine',
        description: 'Complete 4-section morning workout: Warm-up, Balance, Strength, and Core (45 minutes)',
        estimatedMinutes: 45,
        sections: [
            {
                id: 'warmup-mobility-template',
                name: '🟠 Warm-Up & Mobility',
                exercises: [
                    {
                        exerciseId: 'hamstring-stretch',
                        order: 0,
                        customReps: '3 directions × 15–30 sec each leg',
                        customNotes: 'Forward, diagonal, across body directions'
                    },
                    {
                        exerciseId: 'it-band-stretch',
                        order: 1,
                        customReps: '3×15–30 sec each leg',
                        customNotes: 'Outer thigh and hip mobility'
                    },
                    {
                        exerciseId: 'calf-stretch',
                        order: 2,
                        customReps: '3×15 sec each leg',
                        customNotes: 'Wall or step variation'
                    },
                    {
                        exerciseId: 'toe-crawls',
                        order: 3,
                        customReps: '5 reps forward & back',
                        customNotes: 'Foot muscles, ankle, balance'
                    }
                ],
                order: 0
            },
            {
                id: 'balance-coordination-template',
                name: '🟡 Balance & Coordination',
                exercises: [
                    {
                        exerciseId: 'clock-exercise',
                        order: 0,
                        customReps: '3–5 reps each direction per leg',
                        customNotes: 'Ankle, glutes, proprioception'
                    },
                    {
                        exerciseId: 'single-leg-stand',
                        order: 1,
                        customReps: '5×5 sec per leg',
                        customNotes: 'Glutes, ankle stabilizers, core'
                    }
                ],
                order: 1
            },
            {
                id: 'strength-glute-activation-template',
                name: '🟢 Strength & Glute Activation',
                exercises: [
                    {
                        exerciseId: 'quad-press',
                        order: 0,
                        customReps: '5 reps × 5-sec hold each leg',
                        customNotes: 'Inner quad (VMO) activation'
                    },
                    {
                        exerciseId: 'long-arc-quad',
                        order: 1,
                        customReps: '10–15 reps each leg',
                        customNotes: 'Full quad strengthening'
                    },
                    {
                        exerciseId: 'lateral-leg-raise',
                        order: 2,
                        customReps: '10 reps × 5-sec hold each leg',
                        customNotes: 'Glute medius focus'
                    },
                    {
                        exerciseId: 'clamshell',
                        order: 3,
                        customReps: '10 reps each side',
                        customNotes: 'Glute medius, external hip rotators'
                    },
                    {
                        exerciseId: 'bridging',
                        order: 4,
                        customReps: '10 reps',
                        customNotes: 'Glutes, hamstrings, lower back'
                    },
                    {
                        exerciseId: 'glute-squeeze',
                        order: 5,
                        customReps: '10 reps × 5–10 sec hold',
                        customNotes: 'Glute max activation'
                    },
                    {
                        exerciseId: 'glute-march',
                        order: 6,
                        customReps: '10–12 reps (5–6 per leg)',
                        customNotes: 'Glutes, core, hamstrings'
                    },
                    {
                        exerciseId: 'heel-raise',
                        order: 7,
                        customReps: '10–15 reps',
                        customNotes: 'Calves, ankle strength'
                    },
                    {
                        exerciseId: 'reverse-step-up',
                        order: 8,
                        customReps: '10 reps per leg',
                        customNotes: 'Glutes, quads, knee control'
                    }
                ],
                order: 2
            },
            {
                id: 'core-upper-body-template',
                name: '🔵 Core & Upper Body',
                exercises: [
                    {
                        exerciseId: 'push-ups',
                        order: 0,
                        customReps: '10–20 reps',
                        customNotes: 'Chest, arms, core'
                    },
                    {
                        exerciseId: 'crunches',
                        order: 1,
                        customReps: '15–20 reps',
                        customNotes: 'Upper abs focus'
                    },
                    {
                        exerciseId: 'sit-ups',
                        order: 2,
                        customReps: '10–15 reps',
                        customNotes: 'Full abs, hip flexors'
                    },
                    {
                        exerciseId: 'leg-raises',
                        order: 3,
                        customReps: '10 reps',
                        customNotes: 'Lower abs, hip flexors'
                    },
                    {
                        exerciseId: 'plank',
                        order: 4,
                        customReps: '1×30–60 sec',
                        customNotes: 'Full core, glutes, shoulders'
                    },
                    {
                        exerciseId: 'hollow-hold',
                        order: 5,
                        customReps: '2×20–30 sec',
                        customNotes: 'Deep core, spine control'
                    }
                ],
                order: 3
            }
        ]
    },
    {
        name: '🌙 Quick Evening Routine',
        description: 'Short evening routine focusing on stretching and core (20 minutes)',
        estimatedMinutes: 20,
        sections: [
            {
                id: 'evening-stretch-template',
                name: '🧘 Relaxing Stretch',
                exercises: [
                    {
                        exerciseId: 'hamstring-stretch',
                        order: 0,
                        customReps: '2 directions × 20 sec each leg',
                        customNotes: 'Focus on relaxation'
                    },
                    {
                        exerciseId: 'it-band-stretch',
                        order: 1,
                        customReps: '2×20 sec each leg',
                        customNotes: 'Release daily tension'
                    },
                    {
                        exerciseId: 'calf-stretch',
                        order: 2,
                        customReps: '2×15 sec each leg',
                        customNotes: 'Gentle evening stretch'
                    }
                ],
                order: 0
            },
            {
                id: 'evening-core-template',
                name: '💪 Core Finisher',
                exercises: [
                    {
                        exerciseId: 'bridging',
                        order: 0,
                        customReps: '8 reps',
                        customNotes: 'Gentle glute activation'
                    },
                    {
                        exerciseId: 'plank',
                        order: 1,
                        customReps: '1×30 sec',
                        customNotes: 'Hold with good form'
                    },
                    {
                        exerciseId: 'crunches',
                        order: 2,
                        customReps: '12 reps',
                        customNotes: 'Slow and controlled'
                    }
                ],
                order: 1
            }
        ]
    },
    {
        name: '⚡ Quick 15-Min Energizer',
        description: 'Fast morning routine to wake up and energize (15 minutes)',
        estimatedMinutes: 15,
        sections: [
            {
                id: 'quick-warmup-template',
                name: '🔥 Quick Warmup',
                exercises: [
                    {
                        exerciseId: 'toe-crawls',
                        order: 0,
                        customReps: '3 forward & back',
                        customNotes: 'Wake up your feet'
                    },
                    {
                        exerciseId: 'calf-stretch',
                        order: 1,
                        customReps: '2×10 sec each leg',
                        customNotes: 'Quick stretch'
                    }
                ],
                order: 0
            },
            {
                id: 'quick-strength-template',
                name: '💥 Quick Strength',
                exercises: [
                    {
                        exerciseId: 'bridging',
                        order: 0,
                        customReps: '8 reps',
                        customNotes: 'Activate glutes'
                    },
                    {
                        exerciseId: 'push-ups',
                        order: 1,
                        customReps: '5-8 reps',
                        customNotes: 'As many as you can'
                    },
                    {
                        exerciseId: 'plank',
                        order: 2,
                        customReps: '1×20 sec',
                        customNotes: 'Short but effective'
                    }
                ],
                order: 1
            }
        ]
    }
];
