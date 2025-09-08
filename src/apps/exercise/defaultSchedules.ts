import { WorkoutSchedule } from './types';

export const defaultSchedules: WorkoutSchedule[] = [
    {
        id: 'morning-routine',
        name: 'Complete Morning Routine',
        description: 'Comprehensive morning workout covering warm-up, balance, strength, and core',
        sections: [
            {
                id: 'warmup-mobility',
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
                id: 'balance-coordination',
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
                id: 'strength-glute-activation',
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
                id: 'core-upper-body',
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
        ],
        totalEstimatedMinutes: 45,
        createdAt: '2024-01-01T08:00:00.000Z',
        lastModified: '2024-01-01T08:00:00.000Z'
    },
    {
        id: 'evening-routine',
        name: 'Evening Wind-Down',
        description: 'A comprehensive evening routine to strengthen and stretch after your day',
        sections: [
            {
                id: 'evening-strength',
                name: 'Strength & Stability',
                exercises: [
                    {
                        exerciseId: 'clock-exercise',
                        order: 0,
                        customReps: '3 reps each direction',
                        customNotes: 'Focus on balance and control'
                    },
                    {
                        exerciseId: 'quad-press',
                        order: 1,
                        customReps: '5×5 sec hold per leg',
                        customNotes: 'Strengthen those inner quads'
                    },
                    {
                        exerciseId: 'long-arc-quad',
                        order: 2,
                        customReps: '10 reps per leg',
                        customNotes: 'Full range quad strengthening'
                    },
                    {
                        exerciseId: 'lateral-leg-raise',
                        order: 3,
                        customReps: '8×3-sec hold per leg',
                        customNotes: 'Target those stabilizers'
                    },
                    {
                        exerciseId: 'clamshell',
                        order: 4,
                        customReps: '8 reps per side',
                        customNotes: 'Hip rotator activation'
                    }
                ],
                order: 0
            },
            {
                id: 'evening-power',
                name: 'Power & Core',
                exercises: [
                    {
                        exerciseId: 'bridging',
                        order: 0,
                        customReps: '10 reps',
                        customNotes: 'Full glute engagement'
                    },
                    {
                        exerciseId: 'glute-march',
                        order: 1,
                        customReps: '8 reps total',
                        customNotes: 'Challenge your stability'
                    },
                    {
                        exerciseId: 'reverse-step-up',
                        order: 2,
                        customReps: '8 reps per leg',
                        customNotes: 'Functional strength building'
                    },
                    {
                        exerciseId: 'push-ups',
                        order: 3,
                        customReps: '8 reps',
                        customNotes: 'Modified if needed'
                    }
                ],
                order: 1
            },
            {
                id: 'evening-core',
                name: 'Core Finisher',
                exercises: [
                    {
                        exerciseId: 'sit-ups',
                        order: 0,
                        customReps: '10 reps',
                        customNotes: 'Full abdominal engagement'
                    },
                    {
                        exerciseId: 'leg-raises',
                        order: 1,
                        customReps: '8 reps',
                        customNotes: 'Lower ab focus'
                    },
                    {
                        exerciseId: 'hollow-hold',
                        order: 2,
                        customReps: '1×20 sec',
                        customNotes: 'Deep core stability'
                    },
                    {
                        exerciseId: 'plank',
                        order: 3,
                        customReps: '1×30 sec',
                        customNotes: 'Full body integration'
                    }
                ],
                order: 2
            },
            {
                id: 'evening-stretch',
                name: 'Relaxing Stretch',
                exercises: [
                    {
                        exerciseId: 'it-band-stretch',
                        order: 0,
                        customReps: '2×20 sec each leg',
                        customNotes: 'Release tension from the day'
                    },
                    {
                        exerciseId: 'hamstring-stretch',
                        order: 1,
                        customReps: '3 directions × 20 sec each leg',
                        customNotes: 'Deep relaxing stretch'
                    },
                    {
                        exerciseId: 'calf-stretch',
                        order: 2,
                        customReps: '2×20 sec each leg',
                        customNotes: 'Release calf tension'
                    }
                ],
                order: 3
            }
        ],
        totalEstimatedMinutes: 35,
        createdAt: '2024-01-01T19:00:00.000Z',
        lastModified: '2024-01-01T19:00:00.000Z'
    },
    {
        id: 'comprehensive-morning-routine',
        name: '🌅 Comprehensive Morning Routine',
        description: 'Complete 4-section morning workout: Warm-up, Balance, Strength, and Core',
        sections: [
            {
                id: 'warmup-mobility-new',
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
                id: 'balance-coordination-new',
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
                id: 'strength-glute-activation-new',
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
                id: 'core-upper-body-new',
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
        ],
        totalEstimatedMinutes: 45,
        createdAt: '2024-01-01T08:30:00.000Z',
        lastModified: '2024-01-01T08:30:00.000Z'
    }
];
