// Auth Service - Frictionless Account System with Isolated User States

export interface UserAccount {
  userId: string;
  name: string;
  password?: string;
  createdAt: number;
}

const ACCOUNTS_KEY = 'fluentmate_registered_accounts';
const ACTIVE_USER_KEY = 'fluentmate_active_user_session';

class AuthService {
  private activeUser: UserAccount | null = null;

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    try {
      const data = localStorage.getItem(ACTIVE_USER_KEY);
      if (data) {
        this.activeUser = JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed loading active user session', e);
      this.activeUser = null;
    }
  }

  public getActiveUser(): UserAccount | null {
    if (!this.activeUser) {
      this.loadSession();
    }
    return this.activeUser;
  }

  public getActiveUserId(): string {
    return this.activeUser?.userId || 'default_user';
  }

  public getAllAccounts(): UserAccount[] {
    try {
      const data = localStorage.getItem(ACCOUNTS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading accounts', e);
    }
    return [];
  }

  /**
   * Frictionless Sign-up: Any ID and password works with zero deadlocks
   */
  public register(userId: string, name: string, password?: string): UserAccount {
    const cleanId = userId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '') || `user_${Date.now()}`;
    const cleanName = name.trim() || 'Learner';

    const account: UserAccount = {
      userId: cleanId,
      name: cleanName,
      password: password || '123456',
      createdAt: Date.now()
    };

    const accounts = this.getAllAccounts();
    const existingIndex = accounts.findIndex((a) => a.userId === cleanId);
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }

    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(account));
    } catch (e) {
      console.warn('Failed persisting account', e);
    }

    this.activeUser = account;
    return account;
  }

  /**
   * Frictionless Sign-in: Any ID logs in cleanly; if new, registers on the fly
   */
  public login(userId: string, password?: string): UserAccount {
    const cleanId = userId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '') || 'learner';
    const accounts = this.getAllAccounts();
    const found = accounts.find((a) => a.userId === cleanId);

    if (found) {
      this.activeUser = found;
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(found));
      return found;
    }

    // Auto-create account if not found so user NEVER gets blocked or stuck!
    const capitalizedName = cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
    return this.register(cleanId, capitalizedName, password);
  }

  public logout(): void {
    this.activeUser = null;
    localStorage.removeItem(ACTIVE_USER_KEY);
  }
}

export const authService = new AuthService();
