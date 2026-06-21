import { http, HttpResponse } from 'msw';

const API_BASE = '';

export const mockUser = {
  id: 'user-1',
  email: 'test@test.com',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: null,
  bio: 'Hello',
  createdAt: '2024-01-01T00:00:00Z',
};

export const mockResource = {
  id: 'res-1',
  title: 'Test Resource',
  description: 'A test resource',
  cloudinaryUrl: 'https://res.cloudinary.com/test.pdf',
  fileType: 'PDF',
  author: mockUser,
  resourceType: {
    id: 'rt-1',
    type: 'Note',
    subject: { id: 'sub-1', name: 'Math', semester: { id: 'sem-1', name: 'S1', course: { id: 'c-1', name: 'CS', university: { id: 'u-1', name: 'MIT' } } } },
  },
  likesCount: 5,
  isLiked: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const handlers = [
  http.post(`${API_BASE}/auth/login`, () =>
    HttpResponse.json({ user: mockUser }),
  ),

  http.post(`${API_BASE}/auth/register`, () =>
    HttpResponse.json({ user: mockUser }),
  ),

  http.post(`${API_BASE}/auth/logout`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.get(`${API_BASE}/auth/me`, () =>
    HttpResponse.json(mockUser),
  ),

  http.put(`${API_BASE}/users/me`, () =>
    HttpResponse.json({ ...mockUser, displayName: 'Updated' }),
  ),

  http.get(`${API_BASE}/users/suggested`, () =>
    HttpResponse.json([mockUser]),
  ),

  http.get(`${API_BASE}/users/search`, () =>
    HttpResponse.json({ data: [mockUser], total: 1, page: 1, limit: 20, totalPages: 1 }),
  ),

  http.get(`${API_BASE}/users/:id`, ({ params }) =>
    HttpResponse.json({ ...mockUser, id: params.id }),
  ),

  http.get(`${API_BASE}/users/:id/followers`, () =>
    HttpResponse.json({ data: [mockUser], total: 1, page: 1, limit: 20, totalPages: 1 }),
  ),

  http.get(`${API_BASE}/users/:id/following`, () =>
    HttpResponse.json({ data: [mockUser], total: 1, page: 1, limit: 20, totalPages: 1 }),
  ),

  http.post(`${API_BASE}/users/:id/follow`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.delete(`${API_BASE}/users/:id/follow`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.get(`${API_BASE}/resources`, () =>
    HttpResponse.json({ data: [mockResource], total: 1, page: 1, limit: 10 }),
  ),

  http.get(`${API_BASE}/resources/trending`, () =>
    HttpResponse.json({ data: [mockResource], total: 1, page: 1, limit: 10 }),
  ),

  http.get(`${API_BASE}/resources/mine`, () =>
    HttpResponse.json({ data: [mockResource], total: 1, page: 1, limit: 20 }),
  ),

  http.post(`${API_BASE}/resources`, () =>
    HttpResponse.json(mockResource),
  ),

  http.get(`${API_BASE}/resources/search`, () =>
    HttpResponse.json({ data: [mockResource], total: 1, page: 1, limit: 20, totalPages: 1 }),
  ),

  http.get(`${API_BASE}/resources/bookmarked`, () =>
    HttpResponse.json({ data: [mockResource], total: 1, page: 1, limit: 20 }),
  ),

  http.get(`${API_BASE}/resources/:id`, ({ params }) =>
    HttpResponse.json({ ...mockResource, id: params.id }),
  ),

  http.delete(`${API_BASE}/resources/:id`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.post(`${API_BASE}/resources/:id/like`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.delete(`${API_BASE}/resources/:id/like`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.post(`${API_BASE}/resources/:id/bookmark`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.delete(`${API_BASE}/resources/:id/bookmark`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.get(`${API_BASE}/resources/:id/comments`, () =>
    HttpResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  ),

  http.post(`${API_BASE}/resources/:id/comments`, () =>
    HttpResponse.json({ id: 'c1', content: 'Nice!', author: mockUser, createdAt: new Date().toISOString() }),
  ),

  http.get(`${API_BASE}/messages`, () =>
    HttpResponse.json([{ id: 'user-2', user: { id: 'user-2', name: 'Other', username: 'other', avatar: '' }, lastMessage: { content: 'Hey', createdAt: new Date().toISOString(), isRead: true }, unreadCount: 0 }]),
  ),

  http.get(`${API_BASE}/messages/unread-count`, () =>
    HttpResponse.json({ count: 2 }),
  ),

  http.get(`${API_BASE}/messages/:userId`, () =>
    HttpResponse.json({ data: [], total: 0, page: 1, limit: 50, totalPages: 0 }),
  ),

  http.post(`${API_BASE}/messages`, () =>
    HttpResponse.json({ id: 'm1', content: 'Hello!', sender: mockUser, receiver: { ...mockUser, id: 'user-2' }, read: false, createdAt: new Date().toISOString() }),
  ),

  http.post(`${API_BASE}/reports`, () =>
    new HttpResponse(null, { status: 201 }),
  ),

  http.get(`${API_BASE}/reports`, () =>
    HttpResponse.json([{ id: 'r1', reason: 'Spam' }]),
  ),

  http.get(`${API_BASE}/notifications`, () =>
    HttpResponse.json({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
  ),

  http.post(`${API_BASE}/notifications/:id/read`, () =>
    HttpResponse.json({ success: true }),
  ),

  http.post(`${API_BASE}/notifications/read-all`, () =>
    HttpResponse.json({ success: true }),
  ),

  http.get(`${API_BASE}/universities`, () =>
    HttpResponse.json([{ id: 'u1', name: 'MIT' }]),
  ),

  http.get(`${API_BASE}/courses`, () =>
    HttpResponse.json([{ id: 'c1', name: 'Computer Science', university: { id: 'u1', name: 'MIT' } }]),
  ),

  http.get(`${API_BASE}/courses/:courseId/semesters`, () =>
    HttpResponse.json([{ id: 'sem1', name: 'Semester 1', courseId: 'c1' }]),
  ),

  http.get(`${API_BASE}/semesters/:semesterId/subjects`, () =>
    HttpResponse.json([{ id: 'sub1', name: 'Mathematics', semesterId: 'sem1' }]),
  ),

  http.get(`${API_BASE}/resource-types`, () =>
    HttpResponse.json([{ id: 'rt1', type: 'Note' }]),
  ),

  http.get(`${API_BASE}/courses/search`, () =>
    HttpResponse.json([{ id: 'c1', name: 'Computer Science' }]),
  ),

  http.post(`${API_BASE}/users/:id/block`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.delete(`${API_BASE}/users/:id/block`, () =>
    new HttpResponse(null, { status: 200 }),
  ),

  http.get(`${API_BASE}/users/blocked`, () =>
    HttpResponse.json([]),
  ),
];
