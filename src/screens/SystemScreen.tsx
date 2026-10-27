// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const C = {
  bg: '#05070d',
  panel: 'rgba(9, 18, 31, 0.92)',
  panel2: 'rgba(12, 26, 44, 0.9)',
  border: '#1c5f8f',
  borderSoft: 'rgba(80, 170, 220, 0.25)',
  cyan: '#7df9ff',
  blue: '#4da6ff',
  green: '#5cffb1',
  gold: '#ffd166',
  red: '#ff5d78',
  text: '#d8ecf7',
  dim: '#7d95a8',
  muted: '#4d6b80',
  white: '#ffffff',
};

type StatKey = 'STR' | 'END' | 'AGI' | 'FOC' | 'REC' | 'DISC';
type Delta = Partial<Record<StatKey, number>>;

const STAT_META: { key: StatKey; label: string; color: string }[] = [
  { key: 'STR', label: 'Strength', color: '#ff8a5b' },
  { key: 'END', label: 'Endurance', color: '#ffd166' },
  { key: 'AGI', label: 'Agility', color: '#5cffb1' },
  { key: 'FOC', label: 'Focus', color: '#7df9ff' },
  { key: 'REC', label: 'Recovery', color: '#b18cff' },
  { key: 'DISC', label: 'Discipline', color: '#4da6ff' },
];

const BASE_STATS: Record<StatKey, number> = {
  STR: 41, END: 36, AGI: 30, FOC: 58, REC: 44, DISC: 62,
};

const DAILY_QUESTS = [
  { id: 'exam-co', icon: '📝', title: 'PT-2: Computer Organization', time: '10:45 – 12:15', reward: 'FOC +2', deltas: { FOC: 2 }, exp: 25 },
  { id: 'exam-pl', icon: '📝', title: 'PT-2: Programming Languages', time: '15:00 – 16:30', reward: 'FOC +2', deltas: { FOC: 2 }, exp: 25 },
  { id: 'legs', icon: '🦵', title: 'Legs + Core', time: '17:00 – 18:00', reward: 'STR +1 · END +1', deltas: { STR: 1, END: 1 }, exp: 30, note: 'SYSTEM OVERRIDE — 2 sets · RPE 6 · no finisher · 25–30 min' },
  { id: 'rev-test', icon: '🧪', title: 'SE Revision: Testing', time: '18:30 – 19:25', reward: 'FOC +1', deltas: { FOC: 1 }, exp: 20 },
  { id: 'rev-final', icon: '✅', title: 'SE Final Revision', time: '19:40 – 20:35', reward: 'FOC +2 · DISC +1', deltas: { FOC: 2, DISC: 1 }, exp: 25 },
  { id: 'sleep', icon: '🌙', title: 'HIDDEN: Sleep before 23:00', time: 'Tonight', reward: 'REC +3', deltas: { REC: 3 }, exp: 25, hidden: true },
];

const WEEKLY = [
  { id: 'w1', text: 'Clear 3 PT-2 exams (27–28 Oct)' },
  { id: 'w2', text: 'Complete 6 scheduled sessions' },
  { id: 'w3', text: 'Add rows / face pulls on Mon + Thu' },
  { id: 'w4', text: 'Add RDL 3×10 on Friday' },
  { id: 'w5', text: 'Log sets × reps × weight × RPE' },
  { id: 'w6', text: 'Sunday = full rest or 20-min walk' },
];

const FLAGS = [
  { id: 'examDeload', label: 'Exam-week deload', desc: 'Leg day downgraded after 2 exams', debuff: 'Heavy Legs', penalty: { REC: 2, FOC: 1 } },
  { id: 'weekDeload', label: '9–15 Nov deload', desc: 'Honor the recovery week', debuff: 'Overtraining', penalty: { STR: 1, DISC: 1 } },
];

function SectionHeader({ title, meta, danger = false }: any) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, danger && { color: C.red }]}>{title}</Text>
      {meta ? <Text style={styles.sectionMeta}>{meta}</Text> : null}
    </View>
  );
}

function Panel({ children, style, danger = false }: any) {
  return <View style={[styles.panel, danger && styles.penaltyPanel, style]}>{children}</View>;
}

function StatCard({ meta, value, delta }: any) {
  const pct = Math.min(100, Math.max(4, value));
  const positive = delta > 0;
  const negative = delta < 0;
  return (
    <View style={styles.statCard}>
      <View style={styles.statTop}>
        <Text style={styles.statKey}>{meta.key}</Text>
        <View style={styles.statValueWrap}>
          {delta !== 0 ? (
            <Text style={[styles.statDeltaInline, positive && { color: C.green }, negative && { color: C.red }]}>
              {positive ? '+' : ''}{delta}{' '}
            </Text>
          ) : null}
          <Text style={[styles.statVal, { color: meta.color }]}>{value}</Text>
        </View>
      </View>
      <Text style={styles.statLabel}>{meta.label}</Text>
      <View style={styles.statTrack}>
        <View style={[styles.statFill, { width: `${pct}%`, backgroundColor: meta.color }]} />
      </View>
    </View>
  );
}

function QuestRow({ quest, done, onToggle }: any) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.75} style={styles.questRow}>
      <View style={[styles.questCheck, done && styles.questCheckDone]}>
        {done ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={styles.questIcon}>{quest.icon}</Text>
      <View style={styles.questBody}>
        <View style={styles.questTitleWrap}>
          <Text style={[styles.questTitle, done && styles.questTitleDone]}>{quest.title}</Text>
          {quest.hidden ? <Text style={styles.hiddenBadge}>HIDDEN</Text> : null}
        </View>
        <Text style={styles.questTime}>{quest.time}</Text>
        {quest.note ? <Text style={styles.questNote}>{quest.note}</Text> : null}
        <Text style={styles.questReward}>▸ {quest.reward}  ·  +{quest.exp} EXP</Text>
      </View>
    </TouchableOpacity>
  );
}

function WeeklyRow({ item, done, onToggle }: any) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.weeklyRow} activeOpacity={0.75}>
      <View style={[styles.weeklyBox, done && styles.questCheckDone]}>
        {done ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={[styles.weeklyText, done && styles.questTitleDone]}>{item.text}</Text>
    </TouchableOpacity>
  );
}

function FlagToggle({ flag, value, onToggle }: any) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.flagRow} activeOpacity={0.8}>
      <View style={styles.flagBody}>
        <Text style={styles.flagLabel}>
          {flag.label}{' '}
          <Text style={{ color: value ? C.green : C.red, fontSize: 9 }}>{value ? '· ACTIVE' : '· OFF'}</Text>
        </Text>
        <Text style={styles.flagDesc}>{flag.desc}</Text>
      </View>
      <View style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}>
        <View style={[styles.knob, value ? styles.knobOn : styles.knobOff]} />
      </View>
    </TouchableOpacity>
  );
}

function RewardChip({ label, value }: any) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </View>
  );
}

export default function SystemScreen() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [weeklyDone, setWeeklyDone] = useState<Record<string, boolean>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({ examDeload: true, weekDeload: true });
  const [claimed, setClaimed] = useState(false);
  const [inventory, setInventory] = useState({ statPoints: 1, potions: 2, territory: 12, expBoosters: 0 });
  const [log, setLog] = useState<string[]>([
    '[SYSTEM] Calendar link established.',
    '[SYSTEM] Player recognized: Kishore S.',
    '[SYSTEM] Phase 2: Overflow active — 51 days remain.',
  ]);

  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0, duration: 1700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(125, 249, 255, 0.22)', 'rgba(125, 249, 255, 0.85)'],
  });

  const pushLog = (line: string) => setLog((prev) => [line, ...prev].slice(0, 7));

  const questDeltas = useMemo(() => {
    const acc: Delta = {};
    DAILY_QUESTS.forEach((q) => {
      if (completed[q.id]) {
        Object.entries(q.deltas).forEach(([k, v]) => {
          acc[k as StatKey] = (acc[k as StatKey] || 0) + (v as number);
        });
      }
    });
    return acc;
  }, [completed]);

  const debuffs = useMemo(() => {
    const acc: Delta = {};
    FLAGS.forEach((f) => {
      if (!flags[f.id]) {
        Object.entries(f.penalty).forEach(([k, v]) => {
          acc[k as StatKey] = (acc[k as StatKey] || 0) + (v as number);
        });
      }
    });
    return acc;
  }, [flags]);

  const stats = useMemo(() => {
    const out = {} as Record<StatKey, number>;
    STAT_META.forEach(({ key }) => {
      out[key] = Math.max(0, BASE_STATS[key] + (questDeltas[key] || 0) - (debuffs[key] || 0));
    });
    return out;
  }, [questDeltas, debuffs]);

  const statDelta = (key: StatKey) => (questDeltas[key] || 0) - (debuffs[key] || 0);

  const completedCount = DAILY_QUESTS.filter((q) => completed[q.id]).length;
  const allDailyDone = completedCount === DAILY_QUESTS.length;
  const dailyProgress = completedCount / DAILY_QUESTS.length;
  const weeklyProgress = WEEKLY.filter((w) => weeklyDone[w.id]).length / WEEKLY.length;
  const activeDebuffs = FLAGS.filter((f) => !flags[f.id]);

  const exp = 1240
    + DAILY_QUESTS.reduce((s, q) => s + (completed[q.id] ? q.exp : 0), 0)
    + (allDailyDone ? 150 : 0)
    + inventory.expBoosters * 50;
  const expMax = 2000;
  const progress = Math.min(1, exp / expMax);

  const toggleQuest = (q: any) => {
    const next = !completed[q.id];
    setCompleted((prev) => ({ ...prev, [q.id]: next }));
    pushLog(next ? `[QUEST CLEARED] ${q.title} — ${q.reward}` : `[QUEST REVERTED] ${q.title}`);
  };

  const toggleWeekly = (w: any) => {
    setWeeklyDone((prev) => ({ ...prev, [w.id]: !prev[w.id] }));
  };

  const toggleFlag = (f: any) => {
    const next = !flags[f.id];
    setFlags((prev) => ({ ...prev, [f.id]: next }));
    if (next) {
      pushLog(`[SYSTEM] ${f.label} restored. Debuff removed.`);
    } else {
      const p = Object.entries(f.penalty).map(([k, v]) => `-${v} ${k}`).join(' · ');
      pushLog(`[PENALTY] ${f.debuff} applied: ${p}.`);
    }
  };

  const claimDaily = () => {
    if (!allDailyDone || claimed) return;
    setClaimed(true);
    setInventory((prev) => ({
      ...prev,
      statPoints: prev.statPoints + 1,
      potions: prev.potions + 1,
      territory: prev.territory + 5,
    }));
    pushLog('[REWARD] Daily Quest clear! +1 Stat Point · +1 Recovery Potion · +5 Territory Integrity.');
  };

  const resetDay = () => {
    setCompleted({});
    setWeeklyDone({});
    setFlags({ examDeload: true, weekDeload: true });
    setClaimed(false);
    setInventory({ statPoints: 1, potions: 2, territory: 12, expBoosters: 0 });
    setLog(['[SYSTEM] Daily instance reset. Quests reissued.']);
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.systemFrame, { borderColor }]}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.systemTag}>
              <Text style={styles.systemTagText}>[ SYSTEM ]</Text>
              <TouchableOpacity onPress={resetDay} style={styles.resetBtn}>
                <Text style={styles.resetText}>↺ RESET</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.playerName}>KISHORE S.</Text>
            <Text style={styles.playerSub}>Player ID · kishores.ad25 · Asia/Kolkata</Text>
            <View style={styles.levelRow}>
              <View style={styles.levelPill}><Text style={styles.levelText}>Lv. 6</Text></View>
              <View style={styles.titlePill}><Text style={styles.titleText}>Exam Week Challenger</Text></View>
            </View>
          </View>

          {/* EXPERIENCE */}
          <Panel style={styles.expPanel}>
            <View style={styles.expHeader}>
              <Text style={styles.expLabel}>EXPERIENCE</Text>
              <Text style={styles.expValue}>{exp} / {expMax} EXP</Text>
            </View>
            <View style={styles.expTrack}>
              <View style={[styles.expFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.expHint}>
              {allDailyDone ? 'Daily quest cleared — reward ready.' : `${DAILY_QUESTS.length - completedCount} quests remaining today.`}
            </Text>
          </Panel>

          {/* STATUS WINDOW */}
          <Panel>
            <SectionHeader title="STATUS WINDOW" meta={`${completedCount}/${DAILY_QUESTS.length} quests`} />
            <View style={styles.statsGrid}>
              {STAT_META.map((meta) => (
                <StatCard key={meta.key} meta={meta} value={stats[meta.key]} delta={statDelta(meta.key)} />
              ))}
            </View>
            <Text style={styles.calibration}>⚠ Provisional stats — complete the Assessment Quest to calibrate baseline.</Text>
          </Panel>

          {/* DAILY QUEST */}
          <Panel>
            <SectionHeader title="DAILY QUEST" meta={`${Math.round(dailyProgress * 100)}%`} />
            <Text style={styles.questSubtitle}>Tue, 27 Oct 2026 · Rank A · Exam Day + Training Day</Text>
            {DAILY_QUESTS.map((q) => (
              <QuestRow key={q.id} quest={q} done={!!completed[q.id]} onToggle={() => toggleQuest(q)} />
            ))}
            <TouchableOpacity
              onPress={claimDaily}
              disabled={!allDailyDone || claimed}
              style={[styles.claimBtn, (!allDailyDone || claimed) && styles.claimBtnDisabled]}
            >
              <Text style={[styles.claimText, (!allDailyDone || claimed) && styles.claimTextDisabled]}>
                {claimed ? '✓ REWARD CLAIMED' : allDailyDone ? 'CLAIM DAILY REWARD' : 'LOCKED — CLEAR ALL QUESTS'}
              </Text>
            </TouchableOpacity>
          </Panel>

          {/* WEEKLY QUEST */}
          <Panel>
            <SectionHeader title="WEEKLY QUEST" meta={`${Math.round(weeklyProgress * 100)}%`} />
            <Text style={styles.weeklyTitle}>PT-2 SURVIVAL PROTOCOL</Text>
            <Text style={styles.weeklyRange}>27 Oct – 2 Nov · Reward: Title + FOC +3 · STR +2</Text>
            <View style={styles.miniTrack}>
              <View style={[styles.miniFill, { width: `${weeklyProgress * 100}%` }]} />
            </View>
            {WEEKLY.map((w) => (
              <WeeklyRow key={w.id} item={w} done={!!weeklyDone[w.id]} onToggle={() => toggleWeekly(w)} />
            ))}
          </Panel>

          {/* PENALTY ZONE */}
          <Panel danger>
            <SectionHeader title="PENALTY ZONE" meta={activeDebuffs.length ? `${activeDebuffs.length} ACTIVE` : 'CLEAR'} danger />
            {FLAGS.map((f) => (
              <FlagToggle key={f.id} flag={f} value={!!flags[f.id]} onToggle={() => toggleFlag(f)} />
            ))}
            {activeDebuffs.length ? (
              <View style={styles.debuffList}>
                {activeDebuffs.map((f) => (
                  <Text key={f.id} style={styles.debuffText}>
                    ⚠ {f.debuff}: {Object.entries(f.penalty).map(([k, v]) => `-${v} ${k}`).join(' · ')} · {f.id === 'examDeload' ? 'revision efficiency -15%' : 'progress stall'}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.noDebuff}>✓ No active debuffs. Coach Protocol is being honored.</Text>
            )}
          </Panel>

          {/* INVENTORY */}
          <Panel>
            <SectionHeader title="REWARDS / INVENTORY" meta="Synced" />
            <View style={styles.rewardRow}>
              <RewardChip label="STAT POINTS" value={inventory.statPoints} />
              <RewardChip label="RECOVERY POTION" value={inventory.potions} />
              <RewardChip label="TERRITORY" value={`${inventory.territory} TI`} />
              <RewardChip label="EXP BOOSTER" value={inventory.expBoosters} />
            </View>
            <Text style={styles.inventoryHint}>Clear the daily quest to earn +1 Stat Point, +1 Potion, +5 Territory Integrity.</Text>
          </Panel>

          {/* SYSTEM LOG */}
          <Panel style={styles.logPanel}>
            <SectionHeader title="SYSTEM LOG" meta="LIVE" />
            {log.map((line, i) => (
              <Text key={`${line}-${i}`} style={styles.logLine}>
                <Text style={styles.logTime}>{String(log.length - i).padStart(2, '0')}:</Text> {line}
              </Text>
            ))}
            <Text style={styles.logLine}><Text style={styles.cursor}>▌</Text> awaiting command...</Text>
          </Panel>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>🛡 SAFETY OVERRIDE — Sharp pain, numbness/tingling, chest pain or severe dizziness → abort quest immediately. The System does not override medical advice; consult a clinician/physio if symptoms persist.</Text>
            <Text style={[styles.footerText, { marginTop: 8, color: C.muted }]}>90-Day Plan ends 2026-12-16 · 51 days remaining · Phase 2: Overflow.</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  systemFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.bg,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 12,
  },
  scroll: { flex: 1 },
  container: { padding: 18, paddingBottom: 40 },

  header: { marginBottom: 14 },
  systemTag: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  systemTagText: { color: C.cyan, fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, fontWeight: '700' },
  resetBtn: { borderWidth: 1, borderColor: C.borderSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  resetText: { color: C.dim, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 },
  playerName: { color: C.white, fontSize: 24, fontWeight: '800', letterSpacing: 1, marginTop: 8, fontFamily: 'monospace' },
  playerSub: { color: C.dim, fontFamily: 'monospace', fontSize: 10, marginTop: 3 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  levelPill: { backgroundColor: 'rgba(125,249,255,0.12)', borderColor: C.cyan, borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  levelText: { color: C.cyan, fontFamily: 'monospace', fontSize: 12, fontWeight: '700' },
  titlePill: { marginLeft: 8, borderColor: 'rgba(255,209,102,0.5)', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: 'rgba(255,209,102,0.08)' },
  titleText: { color: C.gold, fontFamily: 'monospace', fontSize: 10 },

  panel: {
    backgroundColor: C.panel,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  penaltyPanel: { borderColor: 'rgba(255,93,120,0.55)', backgroundColor: 'rgba(28,8,16,0.85)', shadowColor: '#ff5d78' },
  expPanel: { backgroundColor: 'rgba(8, 22, 38, 0.95)' },
  logPanel: { backgroundColor: 'rgba(2,8,14,0.9)', borderColor: 'rgba(125,249,255,0.2)' },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: C.cyan, fontFamily: 'monospace', fontSize: 12, letterSpacing: 2, fontWeight: '700' },
  sectionMeta: { color: C.muted, fontFamily: 'monospace', fontSize: 9 },

  expHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  expLabel: { color: C.dim, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.5 },
  expValue: { color: C.cyan, fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  expTrack: { height: 10, backgroundColor: '#0a1a2b', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(125,249,255,0.2)' },
  expFill: { height: '100%', backgroundColor: C.cyan, borderRadius: 6 },
  expHint: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', marginBottom: 12, backgroundColor: 'rgba(6,14,24,0.7)', borderColor: C.borderSoft, borderWidth: 1, borderRadius: 10, padding: 10 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statValueWrap: { flexDirection: 'row', alignItems: 'baseline' },
  statKey: { color: C.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  statVal: { fontFamily: 'monospace', fontSize: 15, fontWeight: '800' },
  statDeltaInline: { fontFamily: 'monospace', fontSize: 10, fontWeight: '700' },
  statLabel: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  statTrack: { height: 5, backgroundColor: '#0a1a2b', borderRadius: 4, marginTop: 8, overflow: 'hidden' },
  statFill: { height: '100%', borderRadius: 4 },
  calibration: { color: C.gold, fontFamily: 'monospace', fontSize: 9, marginTop: 4, lineHeight: 14 },

  questSubtitle: { color: C.dim, fontFamily: 'monospace', fontSize: 10, marginBottom: 6 },
  questRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  questCheck: { width: 22, height: 22, borderWidth: 1.5, borderColor: C.border, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1, backgroundColor: 'rgba(5,12,20,0.8)' },
  questCheckDone: { borderColor: C.green, backgroundColor: 'rgba(92,255,177,0.15)' },
  checkMark: { color: C.green, fontSize: 13, fontWeight: '800' },
  questIcon: { fontSize: 16, marginRight: 8, marginTop: 1 },
  questBody: { flex: 1 },
  questTitleWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  questTitle: { color: C.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '600', lineHeight: 17 },
  questTitleDone: { color: C.muted, textDecorationLine: 'line-through' },
  questTime: { color: C.muted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 },
  questNote: { color: C.gold, fontFamily: 'monospace', fontSize: 9, marginTop: 5, lineHeight: 14, backgroundColor: 'rgba(255,209,102,0.07)', padding: 6, borderRadius: 5, borderLeftWidth: 2, borderLeftColor: C.gold },
  questReward: { color: C.cyan, fontFamily: 'monospace', fontSize: 9, marginTop: 4, fontWeight: '700' },
  hiddenBadge: { color: C.gold, fontFamily: 'monospace', fontSize: 8, borderWidth: 1, borderColor: 'rgba(255,209,102,0.4)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, marginLeft: 6 },
  claimBtn: { marginTop: 12, borderWidth: 1, borderColor: C.cyan, borderRadius: 8, paddingVertical: 12, alignItems: 'center', backgroundColor: 'rgba(125,249,255,0.12)' },
  claimBtnDisabled: { borderColor: C.muted, backgroundColor: 'rgba(255,255,255,0.03)' },
  claimText: { color: C.cyan, fontFamily: 'monospace', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  claimTextDisabled: { color: C.muted },

  weeklyTitle: { color: C.text, fontFamily: 'monospace', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  weeklyRange: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginBottom: 10 },
  miniTrack: { height: 6, backgroundColor: '#0a1a2b', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  miniFill: { height: '100%', backgroundColor: C.gold, borderRadius: 4 },
  weeklyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  weeklyBox: { width: 18, height: 18, borderWidth: 1.5, borderColor: C.border, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  weeklyText: { color: C.dim, fontFamily: 'monospace', fontSize: 10, flex: 1 },

  flagRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,93,120,0.12)' },
  flagBody: { flex: 1, paddingRight: 10 },
  flagLabel: { color: C.text, fontFamily: 'monospace', fontSize: 11, fontWeight: '700' },
  flagDesc: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 3 },
  toggle: { width: 46, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  toggleOn: { backgroundColor: 'rgba(92,255,177,0.2)', borderWidth: 1, borderColor: C.green },
  toggleOff: { backgroundColor: 'rgba(255,93,120,0.18)', borderWidth: 1, borderColor: C.red },
  knob: { width: 18, height: 18, borderRadius: 9, backgroundColor: C.white },
  knobOn: { alignSelf: 'flex-end', backgroundColor: C.green },
  knobOff: { alignSelf: 'flex-start', backgroundColor: C.red },
  debuffList: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,93,120,0.08)', borderWidth: 1, borderColor: 'rgba(255,93,120,0.25)' },
  debuffText: { color: C.red, fontFamily: 'monospace', fontSize: 10, lineHeight: 16 },
  noDebuff: { color: C.green, fontFamily: 'monospace', fontSize: 10, marginTop: 10, lineHeight: 16 },

  rewardRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.borderSoft, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(125,249,255,0.06)', marginRight: 8, marginBottom: 8 },
  chipLabel: { color: C.dim, fontFamily: 'monospace', fontSize: 9 },
  chipValue: { color: C.cyan, fontFamily: 'monospace', fontSize: 11, fontWeight: '700', marginLeft: 6 },
  inventoryHint: { color: C.muted, fontFamily: 'monospace', fontSize: 9, marginTop: 8, lineHeight: 14 },

  logLine: { color: C.dim, fontFamily: 'monospace', fontSize: 9, lineHeight: 15 },
  logTime: { color: C.muted },
  cursor: { color: C.cyan, fontWeight: '800' },

  footer: { marginTop: 6, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,209,102,0.3)', backgroundColor: 'rgba(255,209,102,0.05)' },
  footerText: { color: C.gold, fontFamily: 'monospace', fontSize: 9, lineHeight: 15 },
});
