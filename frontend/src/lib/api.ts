const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
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
      "Request failed";
    throw new ApiError(res.status, message, errorData);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: import("./types").User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) =>
    request<{ user: import("./types").User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username, displayName }),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  getMe: () => request<import("./types").User>("/auth/me"),

  updateProfile: (data: Partial<import("./types").User>) =>
    request<import("./types").User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getUser: (id: string) =>
    request<import("./types").User>(`/users/${id}`),

  getSuggestedUsers: () =>
    request<import("./types").User[]>("/users/suggested"),

  getFollowers: (id: string, page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").User>>(`/users/${id}/followers?page=${page}&limit=${limit}`),

  getFollowing: (id: string, page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").User>>(`/users/${id}/following?page=${page}&limit=${limit}`),

  followUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: "POST" }),

  unfollowUser: (id: string) =>
    request<void>(`/users/${id}/follow`, { method: "DELETE" }),

  getUniversities: () =>
    request<import("./types").University[]>("/universities"),

  getCourses: (universityId?: string) =>
    request<import("./types").Course[]>(`/courses?universityId=${universityId || ""}`),

  getSemesters: (courseId: string) =>
    request<import("./types").Semester[]>(`/courses/${courseId}/semesters`),

  getSubjects: (semesterId: string) =>
    request<import("./types").Subject[]>(`/semesters/${semesterId}/subjects`),

  getResourceTypes: () =>
    request<import("./types").ResourceType[]>("/resource-types"),

  getResourceTypesBySubject: (subjectId: string) =>
    request<import("./types").ResourceType[]>(`/subjects/${subjectId}/resource-types`),

  getFeed: (page = 1, limit = 10, filter?: string, hierarchy?: { universityId?: string; courseId?: string; semesterId?: string; subjectId?: string; authorId?: string }) => {
    let url = `/resources?page=${page}&limit=${limit}`;
    if (filter) url += `&filter=${filter}`;
    if (hierarchy?.authorId) url += `&authorId=${hierarchy.authorId}`;
    if (hierarchy?.universityId) url += `&universityId=${hierarchy.universityId}`;
    if (hierarchy?.courseId) url += `&courseId=${hierarchy.courseId}`;
    if (hierarchy?.semesterId) url += `&semesterId=${hierarchy.semesterId}`;
    if (hierarchy?.subjectId) url += `&subjectId=${hierarchy.subjectId}`;
    return request<import("./types").FeedResponse>(url);
  },

  getTrending: (page = 1, limit = 10) =>
    request<import("./types").FeedResponse>(`/resources/trending?page=${page}&limit=${limit}`),

  getResource: (id: string) =>
    request<import("./types").Resource>(`/resources/${id}`),

  uploadFile: async (file: File): Promise<import("./types").UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/resources/upload`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  createResource: (data: { title: string; description: string; resourceTypeId?: string; cloudinaryUrl?: string; fileType?: string; subjectId?: string }) =>
    request<import("./types").Resource>("/resources", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMyResources: (page = 1, limit = 20) =>
    request<import("./types").FeedResponse>(`/resources/mine?page=${page}&limit=${limit}`),

  getBookmarked: (page = 1, limit = 20) =>
    request<import("./types").FeedResponse>(`/resources/bookmarked?page=${page}&limit=${limit}`),

  bookmarkResource: (id: string) =>
    request<void>(`/resources/${id}/bookmark`, { method: "POST" }),

  unbookmarkResource: (id: string) =>
    request<void>(`/resources/${id}/bookmark`, { method: "DELETE" }),

  deleteResource: (id: string) =>
    request<void>(`/resources/${id}`, { method: "DELETE" }),

  likeResource: (id: string) =>
    request<void>(`/resources/${id}/like`, { method: "POST" }),

  unlikeResource: (id: string) =>
    request<void>(`/resources/${id}/like`, { method: "DELETE" }),

  getComments: (resourceId: string, page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").Comment>>(`/resources/${resourceId}/comments?page=${page}&limit=${limit}`),

  addComment: (resourceId: string, content: string) =>
    request<import("./types").Comment>(`/resources/${resourceId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  getConversations: () =>
    request<import("./types").Conversation[]>("/messages"),

  getUnreadMessageCount: () =>
    request<{ count: number }>("/messages/unread-count"),

  getMessages: (userId: string, page = 1, limit = 50) =>
    request<import("./types").PaginatedResult<import("./types").Message>>(`/messages/${userId}?page=${page}&limit=${limit}`),

  sendMessage: (receiverId: string, content: string) =>
    request<import("./types").Message>("/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    }),

  searchResources: (q: string, page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").Resource>>(`/resources/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  searchUsers: (q: string, page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").User>>(`/users/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),

  searchCourses: (q: string) =>
    request<import("./types").Course[]>(`/courses/search?q=${encodeURIComponent(q)}`),

  getStories: () =>
    request<{ user: { id: string; displayName: string; username: string; avatarUrl: string | null }; stories: { id: string; mediaUrl: string; mediaType: string; caption: string | null; createdAt: string; expiresAt: string; views: number; viewed: boolean }[] }[]>("/stories/following"),

  getDiscoverStories: () =>
    request<{ id: string; mediaUrl: string; mediaType: string; caption: string | null; createdAt: string; expiresAt: string; views: number; viewed: boolean; author: { id: string; displayName: string; username: string; avatarUrl: string | null } }[]>("/stories/discover"),

  getMyStories: () =>
    request<{ id: string; mediaUrl: string; mediaType: string; caption: string | null; createdAt: string; expiresAt: string; scheduledAt: string | null; published: boolean; views: number; expired: boolean }[]>("/stories/mine"),

  getArchivedStories: () =>
    request<import("./types").ArchivedStory[]>("/stories/archived"),

  createPost: (data: { content: string; imageUrl?: string }) =>
    request<import("./types").Post>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getPosts: (page = 1, limit = 10) =>
    request<import("./types").FeedResponsePost>(`/posts?page=${page}&limit=${limit}`),

  getMyPosts: (page = 1, limit = 20) =>
    request<import("./types").FeedResponsePost>(`/posts/mine?page=${page}&limit=${limit}`),

  deletePost: (id: string) =>
    request<void>(`/posts/${id}`, { method: "DELETE" }),

  createStory: (data: { mediaUrl: string; mediaType?: string; caption?: string; scheduledAt?: string }) =>
    request<{ id: string; mediaUrl: string; mediaType: string; caption: string | null; createdAt: string; expiresAt: string; scheduledAt: string | null }>("/stories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  viewStory: (id: string) =>
    request<void>(`/stories/${id}/view`, { method: "POST" }),

  getStoryViews: (id: string) =>
    request<{ count: number; viewers: { id: string; displayName: string; username: string; avatarUrl: string | null }[] }>(`/stories/${id}/views`),

  deleteStory: (id: string) =>
    request<void>(`/stories/${id}`, { method: "DELETE" }),

  createReport: (data: { resourceId?: string; userId?: string; reason: string }) =>
    request<void>("/reports", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getNotifications: (page = 1, limit = 20) =>
    request<import("./types").PaginatedResult<import("./types").Notification>>(`/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: "POST" }),

  markAllNotificationsRead: () =>
    request<void>("/notifications/read-all", { method: "POST" }),

  blockUser: (id: string) =>
    request<void>(`/users/${id}/block`, { method: "POST" }),

  unblockUser: (id: string) =>
    request<void>(`/users/${id}/block`, { method: "DELETE" }),

  getBlockedUsers: () =>
    request<import("./types").User[]>("/users/blocked"),
};
