import { LeadStatus } from '../types';

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Interested',
  'Negotiation',
  'Won',
  'Lost',
];

// TODO: tweak to taste — kept simple & professional (CRM-style neutral palette)
export const COLORS = {
  primary: '#2F54EB',
  primaryDark: '#1D39C4',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  danger: '#E5484D',
  success: '#12B76A',

  // Status badge colors — feel free to expand per status
  status: {
    New: '#2F54EB',
    Contacted: '#F59E0B',
    Interested: '#8B5CF6',
    Negotiation: '#F97316',
    Won: '#12B76A',
    Lost: '#E5484D',
  } as Record<LeadStatus, string>,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const PAGE_SIZE = 10;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@lead_app/auth_token',
  AUTH_USER: '@lead_app/auth_user',
};
