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
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: LeadStatus;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadFormValues {
  name: string;
  phone: string;
  email: string;
  company: string;
  status: LeadStatus;
  notes?: string;
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
  isHydrated: boolean;
}

export interface LeadsState {
  items: Lead[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: LeadStatus | 'All';
  page: number;
  hasMore: boolean;
}


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
  AddEditLead: { leadId?: string };
};
