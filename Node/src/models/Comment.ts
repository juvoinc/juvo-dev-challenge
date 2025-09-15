import { User } from './User';
import { Post } from './Post';

export interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
  postId: number;
  user?: User;
  post?: Post;
}

export interface CreateCommentRequest {
  content: string;
  userId: number;
  postId: number;
}
