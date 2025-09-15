export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  posts?: Post[];
  comments?: Comment[];
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

import { Post } from './Post';
import { Comment } from './Comment';
