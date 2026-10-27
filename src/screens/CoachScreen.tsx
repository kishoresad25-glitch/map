// @ts-nocheck
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import GymCoachPanel from '../components/GymCoachPanel';

export default function CoachScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tag}>[ GYM COACH ]</Text>
        <Text style={styles.title}>System Coach Protocol</Text>
        <Text style={styles.sub}>Dynamic prescription · progression · recovery</Text>
      </View>
      <GymCoachPanel />
      <Text style={styles.footer}>The Coach reads your 90-day plan and adjusts to sleep, RPE, soreness and exam load.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070d' },
  container: { maxWidth: 560, width: '100%', alignSelf: 'center', padding: 18, paddingBottom: 40 },
  header: { marginBottom: 14 },
  tag: { color: '#5cffb1', fontFamily: 'monospace', fontSize: 12, letterSpacing: 3, fontWeight: '700' },
  title: { color: '#ffffff', fontFamily: 'monospace', fontSize: 22, fontWeight: '800', marginTop: 8 },
  sub: { color: '#7d95a8', fontFamily: 'monospace', fontSize: 10, marginTop: 4 },
  footer: { color: '#4d6b80', fontFamily: 'monospace', fontSize: 9, lineHeight: 14, marginTop: 8 },
});
