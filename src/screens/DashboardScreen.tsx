import React, { useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchLeads, setSearchQuery, setStatusFilter } from '../store/slices/leadsSlice';
import { logout } from '../store/slices/authSlice';
import { useDebounce } from '../hooks/useDebounce';
import { MainStackParamList, Lead, LeadStatus } from '../types';
import { LEAD_STATUSES, COLORS, SPACING } from '../constants';
import LeadListItem from '../components/LeadListItem';
import { FormInput } from '../components/FormControls';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

type Props = NativeStackScreenProps<MainStackParamList, 'Dashboard'>;

const FILTERS: Array<LeadStatus | 'All'> = ['All', ...LEAD_STATUSES];

export default function DashboardScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { items, isLoading, isLoadingMore, error, searchQuery, statusFilter, hasMore } = useAppSelector(
    state => state.leads
  );
  const user = useAppSelector(state => state.auth.user);

  const debouncedSearch = useDebounce(searchQuery, 400);

  // Re-fetch (reset to page 1) whenever the debounced search text or the status filter changes.
  useEffect(() => {
    dispatch(fetchLeads({ reset: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter]);

  const handleRefresh = () => dispatch(fetchLeads({ reset: true }));
  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !isLoading) dispatch(fetchLeads({ reset: false }));
  };

  const handleOpenLead = (lead: Lead) => navigation.navigate('LeadDetails', { leadId: lead.id });

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Leads</Text>
          {user?.name ? <Text style={styles.headerSubtitle}>{user.name}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <FormInput
          label=""
          placeholder="Search by name, company, phone or email"
          value={searchQuery}
          onChangeText={text => dispatch(setSearchQuery(text))}
          style={{ marginBottom: 0 }}
        />
      </View>

      {/* TODO: consider extracting this into a <StatusFilterBar /> component if it grows */}
      <View>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const active = item === statusFilter;
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => dispatch(setStatusFilter(item))}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <LoadingView label="Loading leads…" />
      ) : error ? (
        <ErrorView message={error} onRetry={handleRefresh} />
      ) : items.length === 0 ? (
        <EmptyView title="No leads found" subtitle="Try adjusting your search or filter." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <LeadListItem lead={item} onPress={handleOpenLead} />}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          // Perf props — tune based on real device profiling
          initialNumToRender={10}
          windowSize={7}
          removeClippedSubviews
          ListFooterComponent={isLoadingMore ? <LoadingView label="Loading more…" /> : null}
          contentContainerStyle={{ paddingVertical: SPACING.sm }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditLead', {})}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  headerSubtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  logoutButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.danger },
  searchBar: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  filterRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: COLORS.text },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
});
