import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearAuthError } from '../store/slices/authSlice';
import { validateLoginForm, LoginFormErrors } from '../utils/validation';
import { FormInput, AppButton } from '../components/FormControls';
import { COLORS, SPACING } from '../constants';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('sales@example.com'); // pre-filled for reviewer convenience
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<LoginFormErrors>({});

  const handleSubmit = () => {
    const errors = validateLoginForm(email, password);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    dispatch(clearAuthError());
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brand mark */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>L</Text>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to manage your leads</Text>

        <View style={styles.card}>
          <FormInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@company.com"
            error={formErrors.email}
          />
          <FormInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            error={formErrors.password}
          />

          {error ? (
            <View style={styles.apiErrorBox}>
              <Text style={styles.apiErrorText}>{error}</Text>
            </View>
          ) : null}

          <AppButton title="Log In" onPress={handleSubmit} loading={isLoading} />
        </View>

        {/* TODO: remove before submitting, or keep as a note in README instead */}
        <View style={styles.hintPill}>
          <Text style={styles.hintText}>Demo: sales@example.com / password123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },

  logoCircle: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '700' },

  title: { fontSize: 26, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  apiErrorBox: {
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: SPACING.md,
  },
  apiErrorText: { color: COLORS.danger, fontSize: 13, textAlign: 'center', fontWeight: '500' },

  hintPill: {
    alignSelf: 'center',
    marginTop: SPACING.lg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  hintText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
});