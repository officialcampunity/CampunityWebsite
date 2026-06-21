import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../test/test-utils';
import AuthModal from '../AuthModal';

const mockPush = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockRegister = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
    user: null,
    loading: false,
    logout: vi.fn(),
    updateUser: vi.fn(),
  }),
}));

const mockClose = vi.hoisted(() => vi.fn());
const mockToggle = vi.hoisted(() => vi.fn());
const mockModalState = vi.hoisted(() => ({ isOpen: true, mode: 'login' }));

vi.mock('@/lib/auth-modal-context', () => ({
  useAuthModal: () => ({
    isOpen: mockModalState.isOpen,
    mode: mockModalState.mode,
    close: mockClose,
    toggle: mockToggle,
    open: vi.fn(),
  }),
}));

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockModalState.isOpen = true;
    mockModalState.mode = 'login';
  });

  it('renders login form by default', () => {
    render(<AuthModal />);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows register form when mode is register', () => {
    mockModalState.mode = 'register';
    render(<AuthModal />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Display name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm')).toBeInTheDocument();
  });

  it('returns null when not open', () => {
    mockModalState.isOpen = false;
    const { container } = render(<AuthModal />);
    expect(container.innerHTML).toBe('');
  });

  it('toggles between login and register', () => {
    render(<AuthModal />);
    const toggleButton = screen.getByText('Sign Up');
    fireEvent.click(toggleButton);
    expect(mockToggle).toHaveBeenCalled();
  });

  it('shows forgot password link in login mode', () => {
    render(<AuthModal />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('closes on backdrop click', () => {
    render(<AuthModal />);
    fireEvent.click(document.querySelector('.fixed.inset-0.z-\\[100\\] > div')!);
    expect(mockClose).toHaveBeenCalled();
  });

  it('displays error message', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<AuthModal />);
    fireEvent.change(screen.getByPlaceholderText('Email address'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
