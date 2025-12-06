import { signInWithEmail, signUpWithEmail } from '../supabaseAuthService';
import { auth } from '../../config/supabase';

// Mock the supabase config module
jest.mock('../../config/supabase', () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

// Mock logger to avoid console noise during tests
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('Supabase Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithEmail', () => {
    it('should call signInWithPassword with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = { id: '123', email };
      const mockSession = { access_token: 'token' };

      (auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signInWithEmail(email, password);

      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password,
      });
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
    });

    it('should return error when sign in fails', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockError = { message: 'Invalid login credentials' };

      (auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      });

      const result = await signInWithEmail(email, password);

      expect(result.error).toEqual(mockError);
      expect(result.user).toBeNull();
    });
  });

  describe('signUpWithEmail', () => {
    it('should call signUp with correct data', async () => {
      const email = 'new@example.com';
      const password = 'password123';
      const metadata = { name: 'New User' };
      const mockUser = { id: '456', email };

      (auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await signUpWithEmail(email, password, metadata);

      expect(auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });
  });
});
