import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LeadStatus } from '../types';
import { COLORS } from '../constants';

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const color = COLORS.status[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});
