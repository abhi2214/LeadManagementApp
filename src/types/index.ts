export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export interface Note {
  id: string;
  text: string;
  createdAt: string; // ISO date
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: LeadStatus;
  notes: Note[];
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}

// Payload used by both create and update forms
export interface LeadFormValues {
  name: string;
  phone: string;
  email: string;
  company: string;
  status: LeadStatus;
  notes?: string; // free-text note entered on the form, converted to a Note on submit
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean; // becomes true once AsyncStorage has been checked on app boot
}

export interface LeadsState {
  items: Lead[];
  isLoading: boolean; // initial load / refresh
  isLoadingMore: boolean; // pagination
  error: string | null;
  searchQuery: string;
  statusFilter: LeadStatus | 'All';
  page: number;
  hasMore: boolean;
}

// Root navigation param lists — keep these in sync with navigation/types.ts
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainStackParamList = {
  Dashboard: undefined;
  LeadDetails: { leadId: string };
  AddEditLead: { leadId?: string }; // undefined leadId = "Add" mode
};
