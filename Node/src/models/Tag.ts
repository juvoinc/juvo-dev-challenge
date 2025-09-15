import { Post } from './Post';

export interface Tag {
  id: number;
  name: string;
  posts?: Post[];
}

export interface CreateTagRequest {
  name: string;
}
