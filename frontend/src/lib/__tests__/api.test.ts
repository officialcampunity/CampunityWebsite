import { describe, it, expect, beforeEach, vi } from 'vitest';

const BASE_URL = '';

class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData: unknown;
    try {
      errorData = await res.json();
    } catch {
      errorData = null;
    }
    const message =
      (errorData as { message?: string })?.message ||
      res.statusText ||
      'Request failed';
    throw new ApiError(res.status, message, errorData);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

const api = {
  login: (email: string, password: string) =>
    request<{ user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, username: string, displayName: string) =>
    request<{ user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, displayName }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  getMe: () => request<any>('/auth/me'),

  updateProfile: (data: Record<string, unknown>) =>
    request<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUser: (id: string) => request<any>(`/users/${id}`),

  getSuggestedUsers: () => request<any[]>('/users/suggested'),

  getFollowers: (id: string, page = 1, limit = 20) =>
    request<any>(`/users/${id}/followers?page=${page}&limit=${limit}`),

  getFollowing: (id: string, page = 1, limit = 20) =>
    request<any>(`/users/${id}/following?page=${page}&limit=${limit}`),

  followUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'POST' }),

  unfollowUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: 'DELETE' }),

  getUniversities: () => request<any[]>('/universities'),

  getCourses: (universityId?: string) =>
    request<any[]>(`/courses?universityId=${universityId || ''}`),

  getSemesters: (courseId: string) =>
    request<any[]>(`/courses/${courseId}/semesters`),

  getSubjects: (semesterId: string) =>
    request<any[]>(`/semesters/${semesterId}/subjects`),

  getResourceTypesBySubject: (subjectId: string) =>
    request<any[]>(`/subjects/${subjectId}/resource-types`),

  getResourceTypes: () => request<any[]>('/resource-types'),

  getFeed: (page = 1, limit = 10, filter?: string) => {
    let url = `/resources?page=${page}&limit=${limit}`;
    if (filter) url += `&filter=${filter}`;
    return request<any>(url);
  },

  getTrending: (page = 1, limit = 10) =>
    request<any>(`/resources/trending?page=${page}&limit=${limit}`),

  getResource: (id: string) => request<any>(`/resources/${id}`),

  createResource: (data: Record<string, unknown>) =>
    request<any>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyResources: (page = 1, limit = 20) =>
    request<any>(`/resources/mine?page=${page}&limit=${limit}`),

  getBookmarked: (page = 1, limit = 20) =>
    request<any>(`/resources/bookmarked?page=${page}&limit=${limit}`),

  bookmarkResource: (id: string) =>
    request<void>(`/resources/${id}/bookmark`, { method: 'POST' }),

  unbookmarkResource: (id: string) =>
    request<void>(`/resources/${id}/bookmark`, { method: 'DELETE' }),

  deleteResource: (id: string) =>
    request<void>(`/resources/${id}`, { method: 'DELETE' }),

  likeResource: (id: string) =>
    request<void>(`/resources/${id}/like`, { method: 'POST' }),

  unlikeResource: (id: string) =>
    request<void>(`/resources/${id}/like`, { method: 'DELETE' }),

  getComments: (resourceId: string, page = 1, limit = 20) =>
    request<any>(`/resources/${resourceId}/comments?page=${page}&limit=${limit}`),

  addComment: (resourceId: string, content: string) =>
    request<any>(`/resources/${resourceId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  getConversations: () => request<any[]>('/messages'),

  getUnreadMessageCount: () => request<{ count: number }>('/messages/unread-count'),

  getMessages: (userId: string, page = 1, limit = 50) =>
    request<any>(`/messages/${userId}?page=${page}&limit=${limit}`),

  sendMessage: (receiverId: string, content: string) =>
    request<any>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    }),

  searchResources: (q: string, page = 1, limit = 20) =>
    request<any>(`/resources/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  searchUsers: (q: string, page = 1, limit = 20) =>
    request<any>(`/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  searchCourses: (q: string) =>
    request<any[]>(`/courses/search?q=${encodeURIComponent(q)}`),

  createReport: (data: Record<string, unknown>) =>
    request<void>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getNotifications: (page = 1, limit = 20) =>
    request<any>(`/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllNotificationsRead: () =>
    request<void>('/notifications/read-all', { method: 'POST' }),

  blockUser: (id: string) =>
    request<void>(`/users/${id}/block`, { method: 'POST' }),

  unblockUser: (id: string) =>
    request<void>(`/users/${id}/block`, { method: 'DELETE' }),

  getBlockedUsers: () => request<any[]>('/users/blocked'),

  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/resources/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
};

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth', () => {
    it('login should POST with email and password', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 'u1', email: 'test@test.com' } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await api.login('test@test.com', 'pass123');

      expect(mockFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123' }),
        credentials: 'include',
      });
      expect(result.user.email).toBe('test@test.com');
    });

    it('register should POST with all fields', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ user: { id: 'u1' } }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.register('test@test.com', 'pass123', 'testuser', 'Test User');

      expect(mockFetch).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'pass123', username: 'testuser', displayName: 'Test User' }),
      }));
    });

    it('logout should POST', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.logout();

      expect(mockFetch).toHaveBeenCalledWith('/auth/logout', expect.objectContaining({ method: 'POST' }));
    });

    it('getMe should GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'u1' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await api.getMe();

      expect(mockFetch).toHaveBeenCalledWith('/auth/me', expect.any(Object));
      expect(result.id).toBe('u1');
    });

    it('should throw ApiError on failed request', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(api.login('test@test.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should handle non-JSON error responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.reject(new Error('Not JSON')),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(api.getMe()).rejects.toThrow('Server Error');
    });
  });

  describe('Users', () => {
    it('getUser should GET with id', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'u1', displayName: 'Test' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await api.getUser('u1');

      expect(mockFetch).toHaveBeenCalledWith('/users/u1', expect.any(Object));
      expect(result.id).toBe('u1');
    });

    it('getSuggestedUsers should GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 'u1' }]),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await api.getSuggestedUsers();

      expect(mockFetch).toHaveBeenCalledWith('/users/suggested', expect.any(Object));
      expect(result).toHaveLength(1);
    });

    it('followUser should POST', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.followUser('u2');

      expect(mockFetch).toHaveBeenCalledWith('/users/u2/follow', expect.objectContaining({ method: 'POST' }));
    });

    it('unfollowUser should DELETE', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.unfollowUser('u2');

      expect(mockFetch).toHaveBeenCalledWith('/users/u2/follow', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  describe('Resources', () => {
    it('getFeed should build correct URL', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.getFeed(1, 10, 'following');

      expect(mockFetch).toHaveBeenCalledWith('/resources?page=1&limit=10&filter=following', expect.any(Object));
    });

    it('getTrending should GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.getTrending(1, 10);

      expect(mockFetch).toHaveBeenCalledWith('/resources/trending?page=1&limit=10', expect.any(Object));
    });

    it('likeResource should POST', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.likeResource('res-1');

      expect(mockFetch).toHaveBeenCalledWith('/resources/res-1/like', expect.objectContaining({ method: 'POST' }));
    });

    it('unlikeResource should DELETE', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.unlikeResource('res-1');

      expect(mockFetch).toHaveBeenCalledWith('/resources/res-1/like', expect.objectContaining({ method: 'DELETE' }));
    });

    it('createResource should POST with data', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'res-1' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.createResource({ title: 'New', description: 'Desc' });

      expect(mockFetch).toHaveBeenCalledWith('/resources', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'New', description: 'Desc' }),
      }));
    });
  });

  describe('Messages', () => {
    it('getConversations should GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 'conv-1' }]),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await api.getConversations();

      expect(mockFetch).toHaveBeenCalledWith('/messages', expect.any(Object));
      expect(result).toHaveLength(1);
    });

    it('sendMessage should POST with receiverId and content', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'm1', content: 'Hello!' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.sendMessage('user-2', 'Hello!');

      expect(mockFetch).toHaveBeenCalledWith('/messages', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ receiverId: 'user-2', content: 'Hello!' }),
      }));
    });
  });

  describe('Search', () => {
    it('searchResources should encode query', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.searchResources('math notes');

      expect(mockFetch).toHaveBeenCalledWith(
        '/resources/search?q=math%20notes&page=1&limit=20',
        expect.any(Object),
      );
    });

    it('searchUsers should GET with query', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.searchUsers('john');

      expect(mockFetch).toHaveBeenCalledWith('/users/search?q=john&page=1&limit=20', expect.any(Object));
    });
  });

  describe('Notifications', () => {
    it('getNotifications should GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await api.getNotifications(1, 20);

      expect(mockFetch).toHaveBeenCalledWith('/notifications?page=1&limit=20', expect.any(Object));
    });

    it('markNotificationRead should POST', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.markNotificationRead('n1');

      expect(mockFetch).toHaveBeenCalledWith('/notifications/n1/read', expect.objectContaining({ method: 'POST' }));
    });
  });

  describe('Block/Unblock', () => {
    it('blockUser should POST', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.blockUser('u2');

      expect(mockFetch).toHaveBeenCalledWith('/users/u2/block', expect.objectContaining({ method: 'POST' }));
    });

    it('unblockUser should DELETE', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve() });
      vi.stubGlobal('fetch', mockFetch);

      await api.unblockUser('u2');

      expect(mockFetch).toHaveBeenCalledWith('/users/u2/block', expect.objectContaining({ method: 'DELETE' }));
    });
  });

  describe('Upload', () => {
    it('uploadFile should send FormData', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ url: 'https://example.com/file.pdf', originalName: 'test.pdf' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      const result = await api.uploadFile(file);

      expect(mockFetch).toHaveBeenCalledWith('/resources/upload', {
        method: 'POST',
        credentials: 'include',
        body: expect.any(FormData),
      });
      expect(result.url).toBe('https://example.com/file.pdf');
    });

    it('uploadFile should throw on failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false });
      vi.stubGlobal('fetch', mockFetch);

      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      await expect(api.uploadFile(file)).rejects.toThrow('Upload failed');
    });
  });
});
