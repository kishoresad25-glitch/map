// @ts-nocheck
import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  assess,
  getDayPlan,
  getPhase,
  getWeeklyBalance,
  isDefaultExamDay,
} from '../coach/gymCoach';

const C = {
  panel: 'rgba(6, 22, 20, 0.92)',
  border: '#1c6b52',
  borderSoft: 'rgba(92, 255, 177, 0.22)',
  green: '#5cffb1',
  cyan: '#7df9ff',
  gold: '#ffd166',
  red: '#ff5d78',
  text: '#d8ecf7',
  dim: '#7d95a8',
  muted: '#4d6b80',
  white: '#ffffff',
  codeBg: 'rgba(2, 10, 8, 0.85)',
};

function Stepper({ label, value, onChange, min, max, unit }: any) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity onPress={dec} style={styles.stepBtn}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
        <Text style={styles.stepperValue}>{value}{unit}</Text>
        <TouchableOpacity onPress={inc} style={styles.stepBtn}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
      </View>
    </View>
  );
}

function Bullet({ children, color = C.dim }: any) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, { color }]}>▸</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function GymCoachPanel({ onLog }: { onLog?: (line: string) => void }) {
  const today = useMemo(() => new Date(), []);
  const phase = useMemo(() => getPhase(today), [today]);
  const plan = useMemo(() => getDayPlan(today), [today]);
  const balance = useMemo(() => getWeeklyBalance(), []);
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  const [sleepHours, setSleepHours] = useState(7);
  const [sessionRPE, setSessionRPE] = useState(7);
  const [soreness, setSoreness] = useState(2);
  const [cleanSessions, setCleanSessions] = useState(2);
  const [examDay, setExamDay] = useState(isDefaultExamDay(today));

  const output = useMemo(
    () => assess({ sleepHours, sessionRPE, soreness, cleanSessions, examDay, phase, plan }),
    [sleepHours, sessionRPE, soreness, cleanSessions, examDay, phase, plan],
  );

  const modeColor = output.mode === 'DELOAD' ? C.gold : output.mode === 'PROGRESS' ? C.green : C.cyan;
  const decisionBg = output.mode === 'DELOAD'
    ? 'rgba(255, 209, 102, 0.10)'
    : output.mode === 'PROGRESS'
      ? 'rgba(92, 255, 177, 0.10)'
      : 'rgba(125, 249, 255, 0.10)';

  const apply = () => {
    if (onLog) onLog(`[COACH] ${output.decision}`);
  };

  return (
    <View style={styles.panel}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>COACH PROTOCOL</Text>
        <Text style={styles.sectionMeta}>LIVE · {phase.key.replace('_', ' ')}</Text>
      </View>

      <Text style={styles.todayLine}>{dayName} — {plan.emoji} {plan.title}</Text>
      <Text style={styles.phaseLine}>{phase.label}</Text>

      <View style={styles.inputs}>
        <Stepper label="SLEEP" value={sleepHours} onChange={setSleepHours} min={3} max={10} unit="h" />
        <Stepper label="SESSION RPE" value={sessionRPE} onChange={setSessionRPE} min={1} max={10} unit="" />
        <Stepper label="SORENESS" value={soreness} onChange={setSoreness} min={1} max={5} unit="/5" />
        <Stepper label="CLEAN SESSIONS" value={cleanSessions} onChange={setCleanSessions} min={0} max={6} unit="" />
      </View>

      <TouchableOpacity
        onPress={() => setExamDay((v) => !v)}
        style={[styles.examToggle, examDay ? styles.examOn : styles.examOff]}
      >
        <Text style={[styles.examText, { color: examDay ? C.gold : C.green }]}>
          {examDay ? '⚠ EXAM DAY MODE — ON' : '✓ EXAM DAY MODE — OFF'}
        </Text>
        <Text style={styles.examHint}>tap to toggle · auto-on 27–28 Oct 2026</Text>
      </TouchableOpacity>

      <View style={[styles.decision, { borderColor: modeColor, backgroundColor: decisionBg }]}>
        <Text style={[styles.decisionMode, { color: modeColor }]}>[ {output.mode} ]</Text>
        <Text style={styles.decisionText}>{output.decision}</Text>
        <Text style={styles.decisionMeta}>
          {output.durationMin} min · {output.targetSets} sets · RPE {output.targetRPE} · cardio {output.cardioMin} min
          {output.skipFinisher ? ' · finisher skipped' : ''}
        </Text>
      </View>

      <Text style={styles.subHead}>TODAY'S PRESCRIPTION</Text>
      <View style={styles.codeBlock}>
        {output.prescription.map((line, i) => (
          <Text key={i} style={styles.codeLine}>
            <Text style={styles.codeNum}>{String(i + 1).padStart(2, '0')} </Text>{line}
          </Text>
        ))}
      </View>

      <Text style={styles.subHead}>COACH NOTES</Text>
      {output.notes.map((n, i) => <Bullet key={`n${i}`}>{n}</Bullet>)}

      <Text style={styles.subHead}>PROGRAM CORRECTIONS</Text>
      <Text style={styles.balanceLine}>
        Weekly balance — push {balance.push} sets · pull {balance.pull} sets · hinge {balance.hinge} sets
      </Text>
      {output.corrections.map((c, i) => <Bullet key={`c${i}`} color={C.gold}>{c}</Bullet>)}

      <Text style={styles.subHead}>RECOVERY</Text>
      <Text style={styles.recovery}>{output.recovery}</Text>

      <Text style={styles.warning}>{output.warning}</Text>

      <TouchableOpacity onPress={apply} style={styles.applyBtn}>
        <Text style={styles.applyText}>APPLY COACH PLAN → LOG</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: C.panel,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { color: C.green, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  sectionMeta: { color: C.muted, fontFamily: 'monospace', fontSize: 9 },
  todayLine: { color: C.white, fontFamily: 'monospace', fontSize: 13, fontWeight: '700' },
  phaseLine: { color: C.green, fontFamily: 'monospace', fontSize: 10, marginTop: 3 },

  inputs: { marginTop: 12, marginBottom: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 5 },
  stepperLabel: { color: C.dim, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 },
  stepperControls: { flexDirection: 'row', alignItems: 'center' },
  stepBtn: { width: 26, height: 24, borderWidth: 1, borderColor: C.borderSoft, borderRadius: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(92,255,177,0.06)' },
  stepBtnText: { color: C.green, fontSize: 14, fontWeight: '700' },
  stepperValue: { color: C.white, fontFamily: 'monospace', fontSize: 12, fontWeight: '700', width: 52, textAlign: 'center' },

  examToggle: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 12 },
  examOn: { borderColor: 'rgba(255,209,102,0.5)', backgroundColor: 'rgba(255,209,102,0.08)' },
  examOff: { borderColor: 'rgba(92,255,177,0.4)', backgroundColor: 'rgba(92,255,177,0.06)' },
  examText: { fontFamily: 'monospace', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  examHint: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 3 },

  decision: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 },
  decisionMode: { fontFamily: 'monospace', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  decisionText: { color: C.text, fontFamily: 'monospace', fontSize: 11, lineHeight: 17, marginTop: 5 },
  decisionMeta: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 6 },

  subHead: { color: C.green, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  codeBlock: { backgroundColor: C.codeBg, borderColor: C.borderSoft, borderWidth: 1, borderRadius: 8, padding: 10 },
  codeLine: { color: C.text, fontFamily: 'monospace', fontSize: 9, lineHeight: 15 },
  codeNum: { color: C.muted },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  bulletDot: { fontFamily: 'monospace', fontSize: 10, marginRight: 6, marginTop: 1 },
  bulletText: { color: C.dim, fontFamily: 'monospace', fontSize: 9, lineHeight: 14, flex: 1 },
  balanceLine: { color: C.cyan, fontFamily: 'monospace', fontSize: 9, marginBottom: 6 },

  recovery: { color: C.text, fontFamily: 'monospace', fontSize: 9, lineHeight: 15 },
  warning: { color: C.gold, fontFamily: 'monospace', fontSize: 9, lineHeight: 14, marginTop: 10, padding: 8, borderRadius: 6, backgroundColor: 'rgba(255,209,102,0.06)', borderLeftWidth: 2, borderLeftColor: C.gold },

  applyBtn: { marginTop: 12, borderWidth: 1, borderColor: C.green, borderRadius: 8, paddingVertical: 11, alignItems: 'center', backgroundColor: 'rgba(92,255,177,0.1)' },
  applyText: { color: C.green, fontFamily: 'monospace', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
});
