import { Exercise } from './types';

export const defaultExercises: Exercise[] = [
    // 1️⃣ Flexibility & Warm-up
    {
        id: 'hamstring-stretch',
        name: '3-Way Hamstring Stretch',
        description: 'Comprehensive hamstring stretch in three directions',
        musclesTargeted: ['Hamstrings', 'Glutes', 'Lower Back'],
        approxTimeMinutes: 3,
        repsOrHold: '3 directions × 15–30 sec each leg',
        detailedSteps: [
            'Sit on the floor with one leg extended straight',
            'Lean forward to stretch straight ahead (hold 15-30 seconds)',
            'Lean slightly toward the outside of your leg (hold 15-30 seconds)',
            'Lean slightly toward the inside of your leg (hold 15-30 seconds)',
            'Switch legs and repeat all three directions'
        ],
        category: 'stretch',
        isDefault: true
    },
    {
        id: 'it-band-stretch',
        name: 'IT Band Cross Stretch',
        description: 'Targets the iliotibial band and outer thigh',
        musclesTargeted: ['IT Band', 'Outer Thigh', 'Hip'],
        approxTimeMinutes: 2,
        repsOrHold: '3×15–30 sec each leg',
        detailedSteps: [
            'Stand with feet hip-width apart',
            'Cross right leg behind left leg',
            'Lean your upper body to the left while pushing your right hip out',
            'Hold for 15-30 seconds, feeling the stretch along your right outer thigh',
            'Return to standing and repeat 2 more times',
            'Switch sides and repeat with left leg crossed behind right'
        ],
        category: 'stretch',
        isDefault: true
    },
    {
        id: 'calf-stretch',
        name: 'Calf Stretch',
        description: 'Stretches calf muscles and Achilles tendon',
        musclesTargeted: ['Calves', 'Achilles Tendon'],
        approxTimeMinutes: 1.5,
        repsOrHold: '3×15 sec each leg',
        detailedSteps: [
            'Stand arm\'s length from a wall',
            'Place right foot back about 3 feet, keeping heel on ground',
            'Keep right leg straight and lean forward against the wall',
            'Hold for 15 seconds, feeling the stretch in your right calf',
            'Repeat 2 more times, then switch to left leg'
        ],
        category: 'stretch',
        isDefault: true
    },
    {
        id: 'toe-crawls',
        name: 'Soft Toe Crawls',
        description: 'Improves foot strength and balance',
        musclesTargeted: ['Feet', 'Toes', 'Balance'],
        approxTimeMinutes: 2,
        repsOrHold: '5 forward & back',
        detailedSteps: [
            'Stand barefoot on a soft surface (carpet or mat)',
            'Lift your toes and spread them wide',
            'Slowly lower toes and grip the surface',
            'Use your toes to pull your foot forward slightly',
            'Repeat this "crawling" motion 5 times forward',
            'Reverse the motion and crawl backward 5 times',
            'Repeat with other foot'
        ],
        category: 'stretch',
        isDefault: true
    },

    // 2️⃣ Balance & Coordination
    {
        id: 'clock-exercise',
        name: 'Clock Exercise',
        description: 'Single-leg balance challenge in multiple directions',
        musclesTargeted: ['Balance', 'Glutes', 'Core'],
        approxTimeMinutes: 4,
        repsOrHold: '3–5 reps in each direction (one leg)',
        detailedSteps: [
            'Stand on your right leg with hands on hips',
            'Imagine standing in the center of a clock face',
            'Tap your left toe to 12 o\'clock (straight ahead) - 3-5 times',
            'Tap to 3 o\'clock (right side) - 3-5 times',
            'Tap to 6 o\'clock (straight back) - 3-5 times',
            'Tap to 9 o\'clock (left side) - 3-5 times',
            'Switch to standing on left leg and repeat with right toe'
        ],
        category: 'balance',
        isDefault: true
    },
    {
        id: 'single-leg-stand',
        name: 'Single Leg Stand',
        description: 'Basic balance exercise for glute and ankle control',
        musclesTargeted: ['Glutes', 'Foot', 'Ankle Control'],
        approxTimeMinutes: 2,
        repsOrHold: '5×5 sec per leg',
        detailedSteps: [
            'Stand on your right leg with left knee slightly bent',
            'Hold your balance for 5 seconds',
            'Focus on keeping your standing leg straight and engaged',
            'Repeat 4 more times on right leg',
            'Switch to left leg and repeat 5 times',
            'Make it harder by closing your eyes or standing on a pillow'
        ],
        category: 'balance',
        isDefault: true
    },

    // 3️⃣ Glute & Leg Strength
    {
        id: 'quad-press',
        name: 'Quad Press (Towel Under Knee)',
        description: 'Strengthens inner quadriceps muscle',
        musclesTargeted: ['Inner Quadriceps'],
        approxTimeMinutes: 2,
        repsOrHold: '5×5 sec hold per leg',
        detailedSteps: [
            'Sit on floor with legs extended',
            'Place a rolled towel under your right knee',
            'Press your knee down into the towel, tightening your quad',
            'Hold for 5 seconds while keeping your leg straight',
            'Relax and repeat 4 more times',
            'Switch to left leg and repeat'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'long-arc-quad',
        name: 'Long Arc Quad Extension',
        description: 'Full range quadriceps strengthening',
        musclesTargeted: ['Quadriceps'],
        approxTimeMinutes: 3,
        repsOrHold: '10–15 reps per leg',
        detailedSteps: [
            'Sit on a chair or bench with back support',
            'Start with your right knee bent at 90 degrees',
            'Slowly straighten your leg until fully extended',
            'Hold for 1 second at the top',
            'Slowly lower back to starting position',
            'Repeat 10-15 times, then switch legs'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'lateral-leg-raise',
        name: 'Lateral Straight Leg Raise',
        description: 'Targets glute medius for hip stability',
        musclesTargeted: ['Glute Medius', 'Hip Stabilizers'],
        approxTimeMinutes: 3,
        repsOrHold: '10×5-sec hold per leg',
        detailedSteps: [
            'Lie on your left side with legs straight',
            'Keep your body in a straight line',
            'Slowly lift your right leg toward the ceiling',
            'Hold for 5 seconds at the top',
            'Slowly lower with control',
            'Repeat 9 more times, then switch sides'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'clamshell',
        name: 'Clamshell',
        description: 'Strengthens external hip rotators',
        musclesTargeted: ['External Hip Rotators', 'Glutes'],
        approxTimeMinutes: 2,
        repsOrHold: '10 reps per side',
        detailedSteps: [
            'Lie on your left side with knees bent at 45 degrees',
            'Keep feet together and core engaged',
            'Lift your right knee while keeping feet touching',
            'Hold for 1 second at the top',
            'Lower with control',
            'Complete 10 reps, then switch sides'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'bridging',
        name: 'Bridging',
        description: 'Strengthens glutes and hamstrings',
        musclesTargeted: ['Glutes', 'Hamstrings', 'Core'],
        approxTimeMinutes: 2,
        repsOrHold: '10 reps',
        detailedSteps: [
            'Lie on your back with knees bent, feet flat on floor',
            'Keep arms at your sides for stability',
            'Squeeze your glutes and lift your hips up',
            'Create a straight line from knees to shoulders',
            'Hold for 2 seconds at the top',
            'Lower slowly and repeat 9 more times'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'glute-squeeze',
        name: 'Glute Squeeze (Lying or Standing)',
        description: 'Activates and strengthens glute max',
        musclesTargeted: ['Glute Max'],
        approxTimeMinutes: 2,
        repsOrHold: '10×5–10 sec holds',
        detailedSteps: [
            'Lie face down or stand with feet hip-width apart',
            'Squeeze your glute muscles as tight as possible',
            'Hold the contraction for 5-10 seconds',
            'Release and relax for 2 seconds',
            'Repeat 9 more times',
            'Focus on really feeling the muscle work'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'glute-march',
        name: 'Glute March (from bridge)',
        description: 'Advanced glute and hamstring strengthening',
        musclesTargeted: ['Glutes', 'Hamstrings', 'Core'],
        approxTimeMinutes: 3,
        repsOrHold: '10–12 reps',
        detailedSteps: [
            'Start in bridge position (hips lifted)',
            'Keep hips level and core tight',
            'Slowly lift right knee toward chest',
            'Hold for 2 seconds while maintaining bridge',
            'Lower right foot back to floor',
            'Repeat with left leg',
            'Continue alternating for 10-12 total reps'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'heel-raise',
        name: 'Standing Heel Raise',
        description: 'Strengthens calf muscles',
        musclesTargeted: ['Calves', 'Ankles'],
        approxTimeMinutes: 2,
        repsOrHold: '10–15 reps',
        detailedSteps: [
            'Stand with feet hip-width apart',
            'Hold onto a wall or chair for balance if needed',
            'Slowly rise up onto your toes',
            'Hold for 1 second at the top',
            'Lower slowly with control',
            'Repeat 10-15 times'
        ],
        category: 'strength',
        isDefault: true
    },
    {
        id: 'reverse-step-up',
        name: 'Reverse Step-Up',
        description: 'Functional glute and quad strengthening',
        musclesTargeted: ['Glutes', 'Quadriceps', 'Knees'],
        approxTimeMinutes: 3,
        repsOrHold: '10 reps per leg',
        detailedSteps: [
            'Stand on a step or sturdy platform',
            'Slowly lower your right foot toward the floor',
            'Tap your toe lightly on the ground',
            'Use your left leg to lift back to starting position',
            'Keep most of your weight on the standing leg',
            'Complete 10 reps, then switch legs'
        ],
        category: 'strength',
        isDefault: true
    },

    // 4️⃣ Core & Upper Body Light
    {
        id: 'push-ups',
        name: 'Push-Ups',
        description: 'Classic upper body and core strengthener',
        musclesTargeted: ['Chest', 'Arms', 'Core', 'Shoulders'],
        approxTimeMinutes: 2,
        repsOrHold: '10 reps',
        detailedSteps: [
            'Start in plank position with hands under shoulders',
            'Keep your body in a straight line',
            'Lower your chest toward the floor',
            'Push back up to starting position',
            'Modify on knees if needed',
            'Repeat 10 times with good form'
        ],
        category: 'core',
        isDefault: true
    },
    {
        id: 'crunches',
        name: 'Crunches',
        description: 'Targets upper abdominal muscles',
        musclesTargeted: ['Upper Abs', 'Core'],
        approxTimeMinutes: 2,
        repsOrHold: '15 reps',
        detailedSteps: [
            'Lie on your back with knees bent',
            'Place hands behind your head lightly',
            'Lift your shoulders off the ground',
            'Focus on contracting your abs',
            'Lower slowly with control',
            'Repeat 15 times'
        ],
        category: 'core',
        isDefault: true
    },
    {
        id: 'sit-ups',
        name: 'Sit-Ups',
        description: 'Full abdominal and hip flexor exercise',
        musclesTargeted: ['Full Abs', 'Hip Flexors'],
        approxTimeMinutes: 2,
        repsOrHold: '10–15 reps',
        detailedSteps: [
            'Lie on your back with knees bent',
            'Secure your feet under something heavy or have someone hold them',
            'Sit all the way up, touching your knees',
            'Lower back down with control',
            'Repeat 10-15 times'
        ],
        category: 'core',
        isDefault: true
    },
    {
        id: 'leg-raises',
        name: 'Leg Raises (core version)',
        description: 'Targets lower abdominal muscles',
        musclesTargeted: ['Lower Abs', 'Hip Flexors'],
        approxTimeMinutes: 2,
        repsOrHold: '10 reps',
        detailedSteps: [
            'Lie on your back with legs straight',
            'Place hands under your lower back for support',
            'Keep your legs straight and lift them up',
            'Raise until they\'re perpendicular to the floor',
            'Lower slowly without touching the ground',
            'Repeat 10 times'
        ],
        category: 'core',
        isDefault: true
    },
    {
        id: 'hollow-hold',
        name: 'Hollow Hold',
        description: 'Isometric core strengthener',
        musclesTargeted: ['Deep Core', 'Abs'],
        approxTimeMinutes: 1,
        repsOrHold: '2×20–30 sec',
        detailedSteps: [
            'Lie on your back with arms overhead',
            'Press your lower back into the floor',
            'Lift your shoulders and legs off the ground',
            'Create a "hollow" or banana shape',
            'Hold for 20-30 seconds',
            'Rest and repeat one more time'
        ],
        category: 'core',
        isDefault: true
    },
    {
        id: 'plank',
        name: 'Plank',
        description: 'Full-body isometric exercise',
        musclesTargeted: ['Core', 'Glutes', 'Shoulders'],
        approxTimeMinutes: 1,
        repsOrHold: '1×30–60 sec',
        detailedSteps: [
            'Start in push-up position or on forearms',
            'Keep your body in a straight line',
            'Engage your core and glutes',
            'Breathe normally while holding',
            'Hold for 30-60 seconds',
            'Focus on quality over duration'
        ],
        category: 'core',
        isDefault: true
    }
];
