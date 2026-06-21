import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  function mockContext(role?: string) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role } }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as any;
  }

  it('should allow access when no roles are required', () => {
    const result = guard.canActivate(mockContext('user'));

    expect(result).toBe(true);
  });

  it('should allow access when user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const result = guard.canActivate(mockContext('admin'));

    expect(result).toBe(true);
  });

  it('should deny access when user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const result = guard.canActivate(mockContext('user'));

    expect(result).toBe(false);
  });

  it('should deny access when no user role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

    const result = guard.canActivate(mockContext(undefined));

    expect(result).toBe(false);
  });
});
