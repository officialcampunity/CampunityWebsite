import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import UserCard from '../UserCard';

const mockUser = {
  id: 'user-1',
  displayName: 'Jane Smith',
  username: 'janesmith',
  avatarUrl: null,
  bio: 'Software developer & student',
  _count: { followers: 42, following: 15, resources: 7 },
};

describe('UserCard', () => {
  it('renders user display name', () => {
    render(<UserCard user={mockUser as any} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders username', () => {
    render(<UserCard user={mockUser as any} />);
    expect(screen.getByText('@janesmith')).toBeInTheDocument();
  });

  it('renders bio when provided', () => {
    render(<UserCard user={mockUser as any} />);
    expect(screen.getByText('Software developer & student')).toBeInTheDocument();
  });

  it('shows follow button', () => {
    render(<UserCard user={mockUser as any} />);
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('shows initials avatar when no avatarUrl', () => {
    render(<UserCard user={mockUser as any} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
