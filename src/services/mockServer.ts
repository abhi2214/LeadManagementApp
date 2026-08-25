/**
 * In-memory mock "server". Simulates network latency and occasional
 * failure so the UI has real loading/error states to handle.
 *
 * This is intentionally the ONLY place that touches the fake DB —
 * everything else (api.ts, slices) goes through the functions below,
 * so swapping this for a real backend later only means editing this file.
 */
import { Lead, LeadStatus, User } from '../types';

const DELAY_MS = 600;
const FAIL_RATE = 0; // set e.g. 0.1 locally if you want to test error states

const randomId = () => Math.random().toString(36).slice(2, 10);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const maybeFail = (message: string) => {
  if (Math.random() < FAIL_RATE) {
    throw new Error(message);
  }
};

// ---- Seed data --------------------------------------------------------

const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Ltd', 'Soylent Inc', 'Stark Industries'];
const STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Negotiation', 'Won', 'Lost'];

function seedLeads(count: number): Lead[] {
  const leads: Lead[] = [];
  for (let i = 1; i <= count; i++) {
    const createdAt = new Date(Date.now() - i * 36e5 * 8).toISOString();
    leads.push({
      id: randomId(),
      name: `Lead ${i}`,
      company: COMPANIES[i % COMPANIES.length],
      phone: `+91 90000 ${String(10000 + i).slice(1)}`,
      email: `lead${i}@example.com`,
      status: STATUSES[i % STATUSES.length],
      notes: [],
      createdAt,
      updatedAt: createdAt,
    });
  }
  return leads;
}

let leadsDb: Lead[] = seedLeads(37); // more than one page, to exercise pagination

const MOCK_USER: User = {
  id: 'u1',
  name: 'Sales Executive',
  email: 'sales@example.com',
};
const MOCK_PASSWORD = 'password123'; // TODO: mention this in README as demo credentials

// ---- Auth ---------------------------------------------------------------

export async function mockLogin(email: string, password: string): Promise<{ user: User; token: string }> {
  await wait(DELAY_MS);
  if (email.trim().toLowerCase() !== MOCK_USER.email || password !== MOCK_PASSWORD) {
    throw new Error('Invalid email or password');
  }
  return { user: MOCK_USER, token: `mock-token-${randomId()}` };
}

// ---- Leads: read ----------------------------------------------------------

export interface FetchLeadsParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: LeadStatus | 'All';
}

export interface FetchLeadsResult {
  data: Lead[];
  hasMore: boolean;
}

export async function mockFetchLeads({ page, pageSize, search, status }: FetchLeadsParams): Promise<FetchLeadsResult> {
  await wait(DELAY_MS);
  maybeFail('Failed to load leads');

  let filtered = leadsDb;
  if (status && status !== 'All') {
    filtered = filtered.filter(l => l.status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return { data: pageItems, hasMore: start + pageSize < filtered.length };
}

export async function mockFetchLeadById(id: string): Promise<Lead> {
  await wait(DELAY_MS / 2);
  const lead = leadsDb.find(l => l.id === id);
  if (!lead) throw new Error('Lead not found');
  return lead;
}

// ---- Leads: write ----------------------------------------------------------

export async function mockCreateLead(payload: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead> {
  await wait(DELAY_MS);
  maybeFail('Failed to create lead');
  const now = new Date().toISOString();
  const lead: Lead = { ...payload, id: randomId(), notes: [], createdAt: now, updatedAt: now };
  leadsDb = [lead, ...leadsDb];
  return lead;
}

export async function mockUpdateLead(id: string, patch: Partial<Omit<Lead, 'id' | 'createdAt'>>): Promise<Lead> {
  await wait(DELAY_MS);
  maybeFail('Failed to update lead');
  const idx = leadsDb.findIndex(l => l.id === id);
  if (idx === -1) throw new Error('Lead not found');
  const updated: Lead = { ...leadsDb[idx], ...patch, updatedAt: new Date().toISOString() };
  leadsDb[idx] = updated;
  return updated;
}

export async function mockAddNote(id: string, text: string): Promise<Lead> {
  await wait(DELAY_MS / 2);
  const idx = leadsDb.findIndex(l => l.id === id);
  if (idx === -1) throw new Error('Lead not found');
  const note = { id: randomId(), text, createdAt: new Date().toISOString() };
  leadsDb[idx] = { ...leadsDb[idx], notes: [note, ...leadsDb[idx].notes], updatedAt: new Date().toISOString() };
  return leadsDb[idx];
}
