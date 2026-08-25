import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addLeadNote, fetchLeads, updateLeadStatus } from '../store/slices/leadsSlice';
import { MainStackParamList, LeadStatus } from '../types';
import { COLORS, LEAD_STATUSES, SPACING } from '../constants';
import StatusBadge from '../components/StatusBadge';
import { AppButton, FormInput } from '../components/FormControls';
import { EmptyView } from '../components/StateViews';

type Props = NativeStackScreenProps<MainStackParamList, 'LeadDetails'>;

export default function LeadDetailsScreen({ route, navigation }: Props) {
  const { leadId } = route.params;
  const dispatch = useAppDispatch();
  const lead = useAppSelector(state => state.leads.items.find(l => l.id === leadId));

  const [noteText, setNoteText] = useState('');
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  // If the list hasn't been loaded yet (e.g. deep link), fall back to a fetch.
  // TODO: replace with a dedicated `fetchLeadById` thunk if you want this screen
  // to work fully standalone rather than relying on the dashboard list.
  useEffect(() => {
    if (!lead) dispatch(fetchLeads({ reset: true }));
  }, [lead, dispatch]);

  if (!lead) {
    return <EmptyView title="Lead not found" subtitle="It may still be loading." />;
  }

  const handleCall = () => Linking.openURL(`tel:${lead.phone}`);
  const handleWhatsApp = () => Linking.openURL(`whatsapp://send?phone=${lead.phone.replace(/\D/g, '')}`);
  const handleEmail = () => Linking.openURL(`mailto:${lead.email}`);

  const handleStatusChange = (status: LeadStatus) => {
    setStatusPickerOpen(false);
    dispatch(updateLeadStatus({ id: lead.id, status }));
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    dispatch(addLeadNote({ id: lead.id, text: noteText.trim() }));
    setNoteText('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: SPACING.md }}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{lead.name}</Text>
        <StatusBadge status={lead.status} />
      </View>
      <Text style={styles.company}>{lead.company}</Text>

      <View style={styles.infoBlock}>
        <InfoRow label="Phone" value={lead.phone} />
        <InfoRow label="Email" value={lead.email} />
        <InfoRow label="Created" value={new Date(lead.createdAt).toLocaleString()} />
        <InfoRow label="Last Updated" value={new Date(lead.updatedAt).toLocaleString()} />
      </View>

      <View style={styles.actionsRow}>
        <ActionButton label="Call" onPress={handleCall} />
        <ActionButton label="WhatsApp" onPress={handleWhatsApp} />
        <ActionButton label="Email" onPress={handleEmail} />
      </View>

      <TouchableOpacity style={styles.sectionHeader} onPress={() => setStatusPickerOpen(o => !o)}>
        <Text style={styles.sectionTitle}>Change Status</Text>
      </TouchableOpacity>
      {/*
        TODO: this inline chip list works but a bottom-sheet/modal picker would look
        more "CRM-native" — swap in your own if you have time left.
      */}
      {statusPickerOpen && (
        <View style={styles.statusOptions}>
          {LEAD_STATUSES.map(status => (
            <TouchableOpacity key={status} style={styles.statusOption} onPress={() => handleStatusChange(status)}>
              <StatusBadge status={status} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.sectionHeader, { marginTop: SPACING.lg }]}
        onPress={() => navigation.navigate('AddEditLead', { leadId: lead.id })}
      >
        <Text style={styles.sectionTitle}>Edit Lead Details →</Text>
      </TouchableOpacity>

      <View style={{ marginTop: SPACING.lg }}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <FormInput
          label=""
          placeholder="Add a note about this lead…"
          value={noteText}
          onChangeText={setNoteText}
          multiline
          style={{ minHeight: 70, textAlignVertical: 'top' }}
        />
        <AppButton title="Add Note" onPress={handleAddNote} variant="secondary" />

        {lead.notes.length === 0 ? (
          <Text style={styles.mutedNote}>No notes yet.</Text>
        ) : (
          lead.notes.map(note => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteText}>{note.text}</Text>
              <Text style={styles.noteDate}>{new Date(note.createdAt).toLocaleString()}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <Text style={styles.actionBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  company: { fontSize: 15, color: COLORS.textMuted, marginTop: 2, marginBottom: SPACING.md },
  infoBlock: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoLabel: { color: COLORS.textMuted, fontSize: 13 },
  infoValue: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  sectionHeader: { paddingVertical: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  statusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.sm },
  statusOption: { marginRight: 4, marginBottom: 4 },
  mutedNote: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.sm },
  noteCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: SPACING.sm,
  },
  noteText: { color: COLORS.text, fontSize: 14 },
  noteDate: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
});
