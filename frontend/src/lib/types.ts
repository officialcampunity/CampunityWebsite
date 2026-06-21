export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
  isFollowing?: boolean;
  isBlocked?: boolean;
  _count?: { followers: number; following: number; resources: number };
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  cloudinaryUrl: string;
  fileType: string;
  author: User;
  resourceType: ResourceType & { subject?: Subject & { semester?: Semester & { course?: Course & { university?: University } } } };
  likes?: { id: string; userId: string }[];
  likesCount?: number;
  commentsCount?: number;
  comments?: Comment[];
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  receiver: User;
  read: boolean;
  createdAt: string;
}

export interface University { id: string; name: string; }
export interface Course { id: string; name: string; university?: { id: string; name: string }; }
export interface Semester { id: string; name: string; courseId: string; }
export interface Subject { id: string; name: string; semesterId: string; }
export interface ResourceType { id: string; type: string; subject?: Subject; }

export interface Notification {
  id: string;
  type: "follow" | "like" | "comment" | "message";
  actor: User;
  recipient: User;
  resourceId: string | null;
  read: boolean;
  createdAt: string;
}

export interface UploadResult {
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  fileType: string;
  extension: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface FeedResponse {
  data: Resource[];
  total: number;
  page: number;
  limit: number;
}

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface FeedResponsePost {
  data: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ArchivedStory {
  id: string;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  createdAt: string;
  expiresAt: string;
  archived: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
