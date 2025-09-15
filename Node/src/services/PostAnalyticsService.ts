import DatabaseConnection from '../database/connection';
import { Database } from 'sqlite3';
import { Post } from '../models/Post';

// ❌ PROBLEMA: Singleton mal implementado - vai criar problema de concorrência
export class PostAnalyticsService {
  private static instance: PostAnalyticsService;
  private db: Database;
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.db = DatabaseConnection.getInstance().getDb();
  }

  public static getInstance(): PostAnalyticsService {
    if (!PostAnalyticsService.instance) {
      PostAnalyticsService.instance = new PostAnalyticsService();
    }
    return PostAnalyticsService.instance;
  }

  // ❌ PROBLEMA: Cache sem TTL e sem limite de tamanho
  async getPostMetrics(postId: number): Promise<any> {
    const cacheKey = `metrics_${postId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          p.*,
          u.name as userName,
          COUNT(DISTINCT c.id) as commentCount,
          COUNT(DISTINCT pt.tagId) as tagCount
        FROM posts p
        LEFT JOIN users u ON p.userId = u.id
        LEFT JOIN comments c ON p.id = c.postId
        LEFT JOIN post_tags pt ON p.id = pt.postId
        WHERE p.id = ?
        GROUP BY p.id
      `;

      this.db.get(query, [postId], (err, result: any) => {
        if (err) {
          reject(err);
          return;
        }

        const metrics = {
          postId,
          title: result?.title,
          userName: result?.userName,
          commentCount: result?.commentCount || 0,
          tagCount: result?.tagCount || 0,
          createdAt: result?.createdAt,
          analyzedAt: new Date()
        };

        // ❌ PROBLEMA: Cache cresce indefinidamente
        this.cache.set(cacheKey, metrics);
        resolve(metrics);
      });
    });
  }

  // ❌ PROBLEMA: Método síncrono que deveria ser assíncrono
  calculateEngagementScore(post: Post): number {
    const daysSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const commentsPerDay = (post.comments?.length || 0) / (daysSinceCreation || 1);
    const tagsWeight = (post.tags?.length || 0) * 0.5;
    
    return Math.round((commentsPerDay + tagsWeight) * 100) / 100;
  }

  // ❌ PROBLEMA: Não limpa cache periodicamente
  clearCache(): void {
    this.cache.clear();
  }
}
