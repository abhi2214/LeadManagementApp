import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Lead } from '../types';
import { COLORS, SPACING } from '../constants';
import StatusBadge from './StatusBadge';

interface Props {
  lead: Lead;
  onPress: (lead: Lead) => void;
}

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

// TODO: wrap in React.memo if profiling shows list re-renders are a bottleneck
export default function LeadListItem({ lead, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(lead)} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(lead.name) || '?'}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{lead.name}</Text>
          <StatusBadge status={lead.status} />
        </View>
        {lead.company ? <Text style={styles.company} numberOfLines={1}>{lead.company}</Text> : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>📞</Text>
          <Text style={styles.meta} numberOfLines={1}>{lead.phone}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaIcon}>✉️</Text>
          <Text style={styles.meta} numberOfLines={1}>{lead.email}</Text>
        </View>

        <Text style={styles.date}>Created {new Date(lead.createdAt).toLocaleDateString()}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.primary}1A`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },

  body: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text, flexShrink: 1 },
  company: { fontSize: 15, color: COLORS.textMuted, marginBottom: 6, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  metaIcon: { fontSize: 11, marginRight: 6, opacity: 0.7 },
  meta: { fontSize: 13, color: COLORS.textMuted, flexShrink: 1 },

  date: { fontSize: 11, color: COLORS.textMuted, marginTop: 6, opacity: 0.8 },

  chevron: { fontSize: 22, color: COLORS.border, fontWeight: '300', marginLeft: 4, alignSelf: 'center' },
});