import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/test-utils';
import NoteCard from '../NoteCard';

vi.mock('next/link', () => ({
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}));

const mockNote = {
  id: 'note-1',
  title: 'Test Note',
  description: 'This is a test note description',
  fileType: 'PDF',
  cloudinaryUrl: '',
  author: {
    id: 'user-1',
    displayName: 'John Doe',
    username: 'johndoe',
    avatarUrl: null,
  },
  createdAt: '2024-01-15T10:00:00Z',
  likesCount: 10,
  commentsCount: 3,
  isLiked: false,
  hierarchy: {
    university: 'MIT',
    course: 'Computer Science',
    semester: 'Semester 1',
    subject: 'Mathematics',
    resourceType: 'Note',
  },
};

describe('NoteCard', () => {
  it('renders author name and username', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders note description', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('This is a test note description')).toBeInTheDocument();
  });

  it('renders likes and comments counts', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders hierarchy information', () => {
    render(<NoteCard note={mockNote} />);
    expect(screen.getByText('MIT')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', () => {
    const onLike = vi.fn();
    render(<NoteCard note={mockNote} onLike={onLike} />);
    const likeButton = screen.getByText('10').closest('button');
    fireEvent.click(likeButton!);
    expect(onLike).toHaveBeenCalled();
  });

  it('shows liked state', () => {
    const likedNote = { ...mockNote, isLiked: true };
    render(<NoteCard note={likedNote} />);
    const likeButton = screen.getByText('10').closest('button');
    expect(likeButton?.className).toContain('text-pink-500');
  });

  it('renders time ago text', () => {
    render(<NoteCard note={mockNote} />);
    const expectedDate = new Date('2024-01-15T10:00:00Z').toLocaleDateString();
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
  });

  it('renders without crashing when no hierarchy provided', () => {
    const noteWithoutHierarchy = { ...mockNote, hierarchy: undefined };
    render(<NoteCard note={noteWithoutHierarchy} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
