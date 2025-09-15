import { User } from './User';
import { Comment } from './Comment';
import { Tag } from './Tag';

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: number;
  user?: User;
  comments?: Comment[];
  tags?: Tag[];
  viewCount?: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  userId: number;
  tags?: string[];
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  tags?: string[];
}

export function validatePost(post: CreatePostRequest): string[] {
  const errors: string[] = [];
  
  if (!post.title || post.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  if (!post.content || post.content.length < 10) {
    errors.push('Content must be at least 10 characters');
  }
  
  if (!post.userId || post.userId <= 0) {
    errors.push('Valid user ID is required');
  }
  
  return errors;
}
