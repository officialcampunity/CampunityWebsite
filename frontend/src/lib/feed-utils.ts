import type { Resource } from './types';

export interface FeedNote {
  id: string;
  title: string;
  description: string;
  fileType: string;
  cloudinaryUrl: string;
  author: { id: string; displayName: string; username: string; avatarUrl: string | null };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  hierarchy?: {
    university: string;
    course: string;
    semester: string;
    subject: string;
    resourceType: string;
  };
}

export function resourceToFeedNote(resource: Resource): FeedNote {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description || '',
    fileType: resource.fileType || resource.resourceType?.type || 'Note',
    cloudinaryUrl: resource.cloudinaryUrl || '',
    author: {
      id: resource.author?.id || '',
      displayName: resource.author?.displayName || 'Unknown',
      username: resource.author?.username || 'unknown',
      avatarUrl: resource.author?.avatarUrl || null,
    },
    createdAt: resource.createdAt,
    likesCount: resource.likesCount || 0,
    commentsCount: resource.commentsCount || 0,
    isLiked: resource.isLiked || false,
    hierarchy: resource.resourceType?.subject
      ? {
          university: resource.resourceType.subject.semester?.course?.university?.name || '',
          course: resource.resourceType.subject.semester?.course?.name || '',
          semester: resource.resourceType.subject.semester?.name || '',
          subject: resource.resourceType.subject.name || '',
          resourceType: resource.resourceType.type || '',
        }
      : undefined,
  };
}
