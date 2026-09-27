import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;
  let mockUsersService: any;
  let mockJwtService: any;
  let mockConfigService: any;

  beforeEach(() => {
    mockUsersService = {
      findByEmail: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      signAsync: vi.fn().mockResolvedValue('test-jwt-token'),
    };

    mockConfigService = {
      get: vi.fn((key: string, fallback?: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
        if (key === 'JWT_EXPIRATION') return '15m';
        return fallback;
      }),
    };

    authService = new AuthService(
      mockUsersService as any,
      mockJwtService as any,
      mockConfigService as any,
    );
  });

  describe('register', () => {
    it('should throw ConflictException if user email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: '1', email: 'existing@example.com' });

      await expect(
        authService.register({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and return tokens when data is valid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        id: 'user-123',
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date(),
      });

      const result = await authService.register({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(result.user.email).toBe('jane@example.com');
      expect(result.accessToken).toBe('test-jwt-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if email is not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'wrong@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
