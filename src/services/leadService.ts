import {
  mockFetchLeads,
  mockFetchLeadById,
  mockCreateLead,
  mockUpdateLead,
  mockAddNote,
  FetchLeadsParams,
  FetchLeadsResult,
} from './mockServer';
import { Lead, LeadFormValues } from '../types';

export const leadService = {
  async list(params: FetchLeadsParams): Promise<FetchLeadsResult> {
    return mockFetchLeads(params);
  },

  async getById(id: string): Promise<Lead> {
    return mockFetchLeadById(id);
  },

  async create(values: LeadFormValues): Promise<Lead> {
    return mockCreateLead({
      name: values.name,
      phone: values.phone,
      email: values.email,
      company: values.company,
      status: values.status,
    });
  },

  async update(id: string, values: LeadFormValues): Promise<Lead> {
    return mockUpdateLead(id, {
      name: values.name,
      phone: values.phone,
      email: values.email,
      company: values.company,
      status: values.status,
    });
  },

  async updateStatus(id: string, status: Lead['status']): Promise<Lead> {
    return mockUpdateLead(id, { status });
  },

  async addNote(id: string, text: string): Promise<Lead> {
    return mockAddNote(id, text);
  },
};
