export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // ❌ PROBLEMA: Password em texto plano na interface
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

// ❌ PROBLEMA: Importação circular potencial
import { Post } from './Post';
import { Comment } from './Comment';
