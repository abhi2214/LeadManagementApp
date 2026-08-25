import { mockLogin } from './mockServer';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    return mockLogin(email, password);
  },
};
