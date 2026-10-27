// @ts-nocheck
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SystemScreen from './screens/SystemScreen';

export default function App() {
  return (
    <View style={styles.root}>
      <SystemScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05070d' },
});
