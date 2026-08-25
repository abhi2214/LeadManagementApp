import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createLead, updateLead } from '../store/slices/leadsSlice';
import { validateLeadForm, LeadFormErrors } from '../utils/validation';
import { MainStackParamList, LeadFormValues, LeadStatus } from '../types';
import { COLORS, LEAD_STATUSES, SPACING } from '../constants';
import { FormInput, AppButton } from '../components/FormControls';
import StatusBadge from '../components/StatusBadge';

type Props = NativeStackScreenProps<MainStackParamList, 'AddEditLead'>;

export default function AddEditLeadScreen({ route, navigation }: Props) {
  const { leadId } = route.params;
  const isEditMode = !!leadId;
  const dispatch = useAppDispatch();
  const existingLead = useAppSelector(state => state.leads.items.find(l => l.id === leadId));

  const [values, setValues] = useState<LeadFormValues>({
    name: existingLead?.name ?? '',
    phone: existingLead?.phone ?? '',
    email: existingLead?.email ?? '',
    company: existingLead?.company ?? '',
    status: existingLead?.status ?? 'New',
    notes: '',
  });
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const setField = <K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) =>
    setValues(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const validationErrors = validateLeadForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      if (isEditMode && leadId) {
        await dispatch(updateLead({ id: leadId, values })).unwrap();
      } else {
        await dispatch(createLead(values)).unwrap();
      }
      navigation.goBack();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.titleRow}>
          <View style={styles.titleIconCircle}>
            <Text style={styles.titleIconText}>{isEditMode ? '✎' : '+'}</Text>
          </View>
          <View>
            <Text style={styles.title}>{isEditMode ? 'Edit Lead' : 'Add Lead'}</Text>
            <Text style={styles.subtitle}>
              {isEditMode ? 'Update contact details and status' : 'Fill in the details below'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Contact info</Text>
          <FormInput label="Name *" value={values.name} onChangeText={t => setField('name', t)} error={errors.name} placeholder="Jane Doe" />
          <FormInput
            label="Phone *"
            value={values.phone}
            onChangeText={t => setField('phone', t)}
            keyboardType="phone-pad"
            error={errors.phone}
            placeholder="(555) 123-4567"
          />
          <FormInput
            label="Email"
            value={values.email}
            onChangeText={t => setField('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            placeholder="jane@company.com"
          />
          <FormInput label="Company" value={values.company} onChangeText={t => setField('company', t)} placeholder="Acme Inc." />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Status</Text>
          <View style={styles.statusRow}>
            {LEAD_STATUSES.map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => setField('status', status)}
                style={styles.statusOption}
                activeOpacity={0.7}
              >
                <View style={values.status === status ? styles.statusSelected : styles.statusUnselected}>
                  <StatusBadge status={status} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Notes</Text>
          <FormInput
            label=""
            value={values.notes}
            onChangeText={t => setField('notes', t)}
            multiline
            placeholder="Add any relevant notes about this lead…"
            style={styles.notesInput}
          />
        </View>

        <AppButton
          title={isEditMode ? 'Save Changes' : 'Create Lead'}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },

  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  titleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  titleIconText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },

  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOption: { marginRight: 4, marginBottom: 4 },
  statusSelected: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: 2,
  },
  statusUnselected: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
    opacity: 0.55,
  },

  notesInput: { minHeight: 90, textAlignVertical: 'top' },
});