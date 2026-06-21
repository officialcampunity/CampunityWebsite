import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import Navbar from '../Navbar';

const mockOpen = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth-modal-context', () => ({
  useAuthModal: () => ({
    open: mockOpen,
    close: vi.fn(),
    isOpen: false,
    mode: 'login',
    toggle: vi.fn(),
  }),
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('Campunity')).toBeInTheDocument();
    expect(screen.getByText('Feed')).toBeInTheDocument();
  });

  it('shows Get Started button when no user', () => {
    render(<Navbar user={null} />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('shows user avatar when logged in', () => {
    const user = { id: 'u1', name: 'Test', username: 'testuser', avatar: '' };
    render(<Navbar user={user} />);
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  it('shows Upload link when logged in', () => {
    const user = { id: 'u1', name: 'Test', username: 'testuser', avatar: '' };
    render(<Navbar user={user} />);
    expect(screen.getByText('Upload')).toBeInTheDocument();
  });

  it('opens dropdown when user avatar is clicked', () => {
    const user = { id: 'u1', name: 'Test', username: 'testuser', avatar: '' };
    render(<Navbar user={user} />);
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls onLogout when logout is clicked', () => {
    const onLogout = vi.fn();
    const user = { id: 'u1', name: 'Test', username: 'testuser', avatar: '' };
    render(<Navbar user={user} onLogout={onLogout} />);
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);
    fireEvent.click(screen.getByText('Logout'));
    expect(onLogout).toHaveBeenCalled();
  });

  it('opens auth modal on Get Started click', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByText('Get Started'));
    expect(mockOpen).toHaveBeenCalledWith('register');
  });
});
