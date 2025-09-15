import DatabaseConnection from '../database/connection';
import { Database } from 'sqlite3';
import { Post, CreatePostRequest } from '../models/Post';
import { User } from '../models/User';
import { Comment } from '../models/Comment';
import { Tag } from '../models/Tag';

export class BlogService {
  private db: Database;

  constructor() {
    this.db = DatabaseConnection.getInstance().getDb();
  }

  // ❌ PROBLEMA: N+1 Query Problem - busca dados relacionados em loops
  async getAllPosts(): Promise<Post[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM posts ORDER BY createdAt DESC', async (err, posts: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        const postsWithDetails: Post[] = [];
        
        // ❌ PROBLEMA: Loop com queries individuais para cada post
        for (const post of posts) {
          const user = await this.getUserById(post.userId);
          const comments = await this.getCommentsByPostId(post.id);
          const tags = await this.getTagsByPostId(post.id);
          
          postsWithDetails.push({
            ...post,
            user,
            comments,
            tags,
            createdAt: new Date(post.createdAt),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined
          });
        }
        
        resolve(postsWithDetails);
      });
    });
  }

  // ❌ PROBLEMA: Método duplica lógica do getAllPosts
  async getPostById(id: number): Promise<Post | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM posts WHERE id = ?', [id], async (err, post: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!post) {
          resolve(null);
          return;
        }

        // ❌ PROBLEMA: Mesma lógica de N+1 queries
        const user = await this.getUserById(post.userId);
        const comments = await this.getCommentsByPostId(post.id);
        const tags = await this.getTagsByPostId(post.id);

        resolve({
          ...post,
          user,
          comments,
          tags,
          createdAt: new Date(post.createdAt),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined
        });
      });
    });
  }

  // ❌ PROBLEMA: Não usa transações para operações relacionadas
  async createPost(postData: CreatePostRequest): Promise<Post> {
    return new Promise((resolve, reject) => {
      const { title, content, userId, tags = [] } = postData;
      
      this.db.run(
        'INSERT INTO posts (title, content, userId) VALUES (?, ?, ?)',
        [title, content, userId],
        async function(err) {
          if (err) {
            reject(err);
            return;
          }

          const postId = this.lastID;
          
          // ❌ PROBLEMA: Adiciona tags sem transação
          for (const tagName of tags) {
            await this.addTagToPost(postId, tagName);
          }

          const newPost = await this.getPostById(postId);
          resolve(newPost!);
        }
      );
    });
  }

  // ❌ PROBLEMA: Método privado que deveria ser otimizado
  private async addTagToPost(postId: number, tagName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // ❌ PROBLEMA: Verifica se tag existe com query separada
      this.db.get('SELECT id FROM tags WHERE name = ?', [tagName], (err, tag: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (tag) {
          // Tag existe, associa ao post
          this.db.run(
            'INSERT OR IGNORE INTO post_tags (postId, tagId) VALUES (?, ?)',
            [postId, tag.id],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        } else {
          // Tag não existe, cria nova
          this.db.run('INSERT INTO tags (name) VALUES (?)', [tagName], function(err) {
            if (err) {
              reject(err);
              return;
            }

            const tagId = this.lastID;
            this.db.run(
              'INSERT INTO post_tags (postId, tagId) VALUES (?, ?)',
              [postId, tagId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      });
    });
  }

  // ❌ PROBLEMA: Métodos auxiliares que fazem queries desnecessárias
  private async getUserById(userId: number): Promise<User | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user: any) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(user ? { ...user, createdAt: new Date(user.createdAt) } : null);
      });
    });
  }

  private async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM comments WHERE postId = ?', [postId], async (err, comments: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        // ❌ PROBLEMA: Mais N+1 queries para buscar usuários dos comentários
        const commentsWithUsers: Comment[] = [];
        for (const comment of comments) {
          const user = await this.getUserById(comment.userId);
          commentsWithUsers.push({
            ...comment,
            user,
            createdAt: new Date(comment.createdAt)
          });
        }

        resolve(commentsWithUsers);
      });
    });
  }

  private async getTagsByPostId(postId: number): Promise<Tag[]> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT t.* FROM tags t
        INNER JOIN post_tags pt ON t.id = pt.tagId
        WHERE pt.postId = ?
      `;
      
      this.db.all(query, [postId], (err, tags: any[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(tags);
      });
    });
  }

  // ❌ PROBLEMA: Busca ineficiente - carrega todos os posts na memória
  async getPostsByUser(userId: number): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter(post => post.userId === userId);
  }

  // ❌ PROBLEMA: Search sem índices e carrega tudo na memória
  async searchPosts(searchTerm: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}
