// @ts-nocheck
// Pure coaching engine. No React, no calendar API — safe to unit test.
// Data below is transcribed from the user's real Google Calendar 90-day plan.

export type PhaseKey = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'MAINTENANCE';
export type Mode = 'DELOAD' | 'PROGRESS' | 'MAINTAIN';

export interface Phase {
  key: PhaseKey;
  label: string;
  sets: number;
  cardioMin: number;
  rule: string;
}

export interface Lift {
  name: string;
  sets: string;
  reps: string;
}

export interface DayPlan {
  day: number; // 0 = Sunday
  key: string;
  emoji: string;
  title: string;
  warmup: string;
  lifts: Lift[];
  finisher: string;
  cooldown: string;
  bonusLift: string;
  cues: string[];
}

export interface CoachInput {
  sleepHours: number;
  sessionRPE: number;
  soreness: number; // 1–5
  cleanSessions: number; // consecutive sessions at target reps, RPE <= 8
  examDay: boolean;
  phase: Phase;
  plan: DayPlan;
}

export interface CoachOutput {
  mode: Mode;
  targetSets: number;
  targetRPE: number;
  cardioMin: number;
  skipFinisher: boolean;
  durationMin: number;
  decision: string;
  prescription: string[];
  notes: string[];
  corrections: string[];
  recovery: string;
  warning: string;
}

const PHASES: Record<PhaseKey, Phase> = {
  PHASE_1: {
    key: 'PHASE_1',
    label: 'Phase 1 — Foundation (until 18 Oct 2026)',
    sets: 3,
    cardioMin: 10,
    rule: '3 sets on main exercises. Build technique before adding load.',
  },
  PHASE_2: {
    key: 'PHASE_2',
    label: 'Phase 2 — Overflow (19 Oct – 15 Nov 2026)',
    sets: 4,
    cardioMin: 12,
    rule: 'Add a 4th set to ONE main lift only when recovery is good. Never to every exercise.',
  },
  PHASE_3: {
    key: 'PHASE_3',
    label: 'Phase 3 — Intensify (16 Nov – 16 Dec 2026)',
    sets: 3,
    cardioMin: 15,
    rule: 'Keep sets steady. Add 1–2 reps OR the smallest weight increase — never both in the same week.',
  },
  MAINTENANCE: {
    key: 'MAINTENANCE',
    label: 'Maintenance — Reassess (after 16 Dec 2026)',
    sets: 3,
    cardioMin: 15,
    rule: '90-day block complete. Deload, retest baseline, then write a new program.',
  },
};

function iso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getPhase(date: Date = new Date()): Phase {
  const d = iso(date);
  if (d <= '2026-10-18') return PHASES.PHASE_1;
  if (d <= '2026-11-15') return PHASES.PHASE_2;
  if (d <= '2026-12-16') return PHASES.PHASE_3;
  return PHASES.MAINTENANCE;
}

export function isDefaultExamDay(date: Date = new Date()): boolean {
  const d = iso(date);
  return d === '2026-10-27' || d === '2026-10-28';
}

const DAY_PLANS: DayPlan[] = [
  {
    day: 0,
    key: 'sun',
    emoji: '🌿',
    title: 'Sunday — Rest / Active Recovery',
    warmup: 'Optional easy walk 20–30 min',
    lifts: [],
    finisher: 'Mobility / stretching 5–10 min',
    cooldown: 'Complete rest if very sore or tired',
    bonusLift: '',
    cues: [
      'Recovery is part of progress.',
      'Do not add extra sets just because you are not sore.',
      'Hydrate, eat enough protein, aim for good sleep.',
    ],
  },
  {
    day: 1,
    key: 'mon',
    emoji: '💪',
    title: 'Monday — Chest + Triceps',
    warmup: 'Warm-up 5–8 min',
    lifts: [
      { name: 'Push-ups', sets: '3×10–12', reps: 'bodyweight, full range' },
      { name: 'Chest press', sets: '3×10–12', reps: 'moderate load, controlled' },
      { name: 'Incline push-ups', sets: '2–3×10', reps: 'bodyweight' },
      { name: 'Triceps exercise', sets: '3×10–12', reps: 'moderate load' },
      { name: 'Plank', sets: '2–3×30 sec', reps: 'hold, neutral spine' },
    ],
    finisher: 'Run or cycle 10 min easy/moderate',
    cooldown: 'Cool-down 5 min',
    bonusLift: 'Push-ups',
    cues: [
      'Quality reps matter more than pain or soreness.',
      'Keep shoulders controlled during pressing.',
      'Stop for sharp shoulder pain, numbness/tingling, chest pain or severe dizziness.',
    ],
  },
  {
    day: 2,
    key: 'tue',
    emoji: '🦵',
    title: 'Tuesday — Legs + Core',
    warmup: 'Warm-up 5–8 min',
    lifts: [
      { name: 'Squats', sets: '3×10–12', reps: 'controlled tempo, knees tracking toes' },
      { name: 'Lunges', sets: '3×10 each leg', reps: 'bodyweight / light load' },
      { name: 'Calf raises', sets: '3×15', reps: 'full range' },
      { name: 'Crunches', sets: '3×20', reps: 'slow, no neck pull' },
      { name: 'Plank', sets: '3×30 sec', reps: 'hold' },
    ],
    finisher: 'Run or cycle 10 min easy/moderate',
    cooldown: 'Gentle stretch 5–8 min',
    bonusLift: 'Squats',
    cues: [
      'Stop if you get sharp back/knee pain, true numbness/tingling or unusual weakness.',
      'Do not add the 4th set if knees or back feel off.',
    ],
  },
  {
    day: 3,
    key: 'wed',
    emoji: '🏋️',
    title: 'Wednesday — Back + Biceps',
    warmup: 'Warm-up 5–8 min',
    lifts: [
      { name: 'Dumbbell rows', sets: '3×10 each side', reps: 'neutral spine, no twisting' },
      { name: 'Reverse fly', sets: '3×10–12', reps: 'light load' },
      { name: 'Biceps curls', sets: '3×10–12', reps: 'moderate load' },
      { name: 'Barbell curls', sets: '3×10', reps: 'moderate load' },
      { name: 'Forearm curls', sets: '2–3×12', reps: 'light load' },
    ],
    finisher: 'Run or cycle 10 min easy/moderate',
    cooldown: 'Cool-down 5 min',
    bonusLift: 'Dumbbell rows',
    cues: [
      'Keep your back neutral during rows.',
      'Do not chase soreness.',
      'Stop for sharp pain or true numbness/tingling.',
    ],
  },
  {
    day: 4,
    key: 'thu',
    emoji: '🏋️',
    title: 'Thursday — Chest + Shoulders',
    warmup: 'Warm-up 5–8 min',
    lifts: [
      { name: 'Push-ups', sets: '3×10–12', reps: 'bodyweight' },
      { name: 'Chest press', sets: '3×10–12', reps: 'moderate load' },
      { name: 'DB shoulder press', sets: '3×10', reps: 'controlled, no arching' },
      { name: 'Lateral raises', sets: '3×12', reps: 'light load' },
      { name: 'Plank', sets: '2–3×30 sec', reps: 'hold' },
    ],
    finisher: 'Run or cycle 10 min easy/moderate',
    cooldown: 'Cool-down 5 min',
    bonusLift: 'Push-ups',
    cues: [
      'Keep shoulders controlled throughout.',
      'Stop for sharp shoulder pain, true numbness/tingling, chest pain or severe dizziness.',
    ],
  },
  {
    day: 5,
    key: 'fri',
    emoji: '🏋️',
    title: 'Friday — Legs + Arms',
    warmup: 'Warm-up 5–8 min',
    lifts: [
      { name: 'Squats', sets: '3×10–12', reps: 'clean form, no bouncing' },
      { name: 'Reverse lunges', sets: '3×10 each leg', reps: 'controlled' },
      { name: 'Calf raises', sets: '3×15', reps: 'full range' },
      { name: 'Biceps curls', sets: '3×10–12', reps: 'moderate load' },
      { name: 'Triceps exercise', sets: '3×10–12', reps: 'moderate load' },
      { name: 'Forearm curls', sets: '2–3×12', reps: 'light load' },
    ],
    finisher: 'Optional 10 min easy cycle',
    cooldown: 'Cool-down 5 min',
    bonusLift: 'Squats',
    cues: [
      'Hydrate and get protein after training.',
      'Stop for sharp pain, true numbness/tingling, unusual weakness, severe dizziness or chest pain.',
    ],
  },
  {
    day: 6,
    key: 'sat',
    emoji: '🔥',
    title: 'Saturday — Cardio + Core',
    warmup: 'Warm-up 5 min',
    lifts: [
      { name: 'Run or cycle', sets: '1×12 min', reps: 'easy/moderate pace' },
      { name: 'Brisk walk', sets: '1×10–15 min', reps: 'easy pace' },
      { name: 'Plank', sets: '3×30 sec', reps: 'hold' },
      { name: 'Crunches', sets: '3×20', reps: 'slow' },
      { name: 'Mountain climbers', sets: '3×20', reps: 'steady' },
    ],
    finisher: 'Gentle stretching 8–10 min',
    cooldown: 'Included in stretching',
    bonusLift: 'Run or cycle',
    cues: [
      'Keep this a lighter day; do not turn it into a max-effort session.',
      'Stop for severe dizziness, chest pain or unusual shortness of breath.',
    ],
  },
];

export function getDayPlan(date: Date = new Date()): DayPlan {
  return DAY_PLANS[date.getDay()];
}

export function getWeeklyBalance() {
  return {
    push: 9,
    pull: 2,
    hinge: 0,
    corrections: [
      'Add 3×12 face pulls or band rows on Mon + Thu — pressing appears 3×/week, pulling only Wed.',
      'Add Romanian deadlifts 3×10 on Friday (or swap reverse lunges) — hip-hinge pattern is missing.',
      'Schedule a deload week 9–15 Nov: 2 sets per main lift, RPE 6, cardio back to 10 min.',
      'Sunday = full rest or 20–30 min easy walk only. No extra sets.',
    ],
  };
}

function replaceLeadingSets(sets: string, n: number): string {
  return sets.replace(/^\d+(?:[–-]\d+)?/, String(n));
}

export function assess(input: CoachInput): CoachOutput {
  const { sleepHours, sessionRPE, soreness, cleanSessions, examDay, phase, plan } = input;
  const poorRecovery = sleepHours < 6 || soreness >= 4 || sessionRPE >= 9;
  const isRestDay = plan.lifts.length === 0;

  let mode: Mode = 'MAINTAIN';
  if (examDay || poorRecovery || (isRestDay && soreness >= 3)) {
    mode = 'DELOAD';
  } else if (
    isRestDay === false &&
    sleepHours >= 7 &&
    sessionRPE <= 8 &&
    soreness <= 2 &&
    cleanSessions >= 2 &&
    (phase.key === 'PHASE_2' || phase.key === 'PHASE_3')
  ) {
    mode = 'PROGRESS';
  }

  const targetSets = mode === 'DELOAD' ? 2 : phase.sets;
  const targetRPE = mode === 'DELOAD' ? 6 : 8;
  const skipFinisher = mode === 'DELOAD';
  const durationMin = mode === 'DELOAD' ? 30 : 60;
  const cardioMin = mode === 'DELOAD' ? Math.max(0, phase.cardioMin - 2) : phase.cardioMin;

  let decision = '';
  if (mode === 'DELOAD') {
    decision = examDay
      ? 'DELOAD — 2 sets @ RPE 6, ~30 min. Exam day: protect focus and revision time.'
      : 'DELOAD — 2 sets @ RPE 6, ~30 min. Recovery flags are high; do not push a PR.';
  } else if (mode === 'PROGRESS' && phase.key === 'PHASE_2') {
    decision = `PROGRESS — add a 4th set to ${plan.bonusLift} ONLY. Keep every other lift at 3 sets.`;
  } else if (mode === 'PROGRESS') {
    decision = `PROGRESS — add 1–2 reps OR the smallest weight to ${plan.bonusLift}. Never both.`;
  } else {
    decision = `MAINTAIN — repeat ${phase.sets} sets @ RPE ≤ 8. No jump today; earn it with clean logs.`;
  }

  const prescription: string[] = [];
  if (isRestDay) {
    prescription.push(
      mode === 'DELOAD'
        ? 'Complete rest today. No gym training.'
        : `Active recovery: ${plan.warmup}; ${plan.finisher}.`,
    );
    prescription.push(plan.cooldown);
  } else {
    prescription.push(`Warm-up: ${plan.warmup}`);
    plan.lifts.forEach((lift) => {
      let sets = replaceLeadingSets(lift.sets, targetSets);
      if (mode === 'PROGRESS' && phase.key === 'PHASE_2' && lift.name === plan.bonusLift) {
        sets = replaceLeadingSets(lift.sets, 4);
      }
      prescription.push(`${sets} ${lift.name} @ ${lift.reps} — target RPE ${targetRPE}`);
    });
    prescription.push(
      skipFinisher
        ? 'Finisher: SKIPPED (deload) — go home, eat, study/sleep.'
        : `Finisher: ${plan.finisher.replace(/\d+ min/, `${cardioMin} min`)}`,
    );
    prescription.push(`Cool-down: ${plan.cooldown}`);
  }

  const notes: string[] = [
    `Phase rule: ${phase.rule}`,
    'Log sets × reps × weight × RPE after every session.',
    'Progress only when all sets hit top reps at RPE ≤ 8 for 2 consecutive sessions.',
    ...plan.cues,
  ];
  if (mode === 'PROGRESS' && phase.key === 'PHASE_3') {
    notes.push('Do not increase reps and weight in the same week — pick one.');
  }
  if (mode === 'DELOAD') {
    notes.push('Exam weeks are for maintaining, not peaking. Sleep is the priority.');
  }

  const recovery =
    'Protein ~1.6–2.0 g/kg/day · carbs + protein within 1–2 h post-workout · 7–9 h sleep · hydrate through the day.';
  const warning =
    'General fitness guidance, not medical advice. Stop on sharp pain, numbness/tingling, chest pain, severe dizziness or unusual shortness of breath; consult a clinician/physio before continuing.';

  return {
    mode,
    targetSets,
    targetRPE,
    cardioMin,
    skipFinisher,
    durationMin,
    decision,
    prescription,
    notes,
    corrections: getWeeklyBalance().corrections,
    recovery,
    warning,
  };
}
