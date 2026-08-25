import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { User } from '../types';

export const storage = {
  async saveSession(user: User, token: string) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.AUTH_TOKEN, token],
      [STORAGE_KEYS.AUTH_USER, JSON.stringify(user)],
    ]);
  },

  async loadSession(): Promise<{ user: User; token: string } | null> {
    const [[, token], [, userStr]] = await AsyncStorage.multiGet([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.AUTH_USER,
    ]);
    if (!token || !userStr) return null;
    try {
      return { token, user: JSON.parse(userStr) as User };
    } catch {
      return null;
    }
  },

  async clearSession() {
    await AsyncStorage.multiRemove([STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.AUTH_USER]);
  },
};
