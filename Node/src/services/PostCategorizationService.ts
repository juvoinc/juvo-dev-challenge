import { PostAnalyticsService } from './PostAnalyticsService';
import { Post } from '../models/Post';

export class PostCategorizationService {
  private analyticsService: PostAnalyticsService;
  private categoryMappings: Map<string, string>;

  constructor() {
    this.analyticsService = PostAnalyticsService.getInstance();
    
    this.categoryMappings = new Map([
      ['tecnologia', 'Tech'],
      ['programação', 'Programming'],
      ['javascript', 'Programming'],
      ['node.js', 'Backend'],
      ['tutorial', 'Educational'],
      ['performance', 'Optimization'],
      ['async', 'Advanced'],
      ['typescript', 'Programming']
    ]);
  }

  async categorizePost(postId: number): Promise<string> {
    try {
      const metrics = await this.analyticsService.getPostMetrics(postId);
      
      if (!metrics) {
        return 'Uncategorized';
      }

      const title = metrics.title?.toLowerCase() || '';
      const categories: string[] = [];

      for (const [key, value] of this.categoryMappings) {
        if (title.includes(key)) {
          if (!categories.includes(value)) {
            categories.push(value);
          }
        }
      }

      if (categories.length === 0) {
        return 'General';
      }

      return categories.join(', ');
    } catch (error) {
      console.error('Error categorizing post:', error);
      return 'Error';
    }
  }

  async getCategoryStats(): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {};
    
    // Assume que há posts com IDs de 1 a 100
    for (let postId = 1; postId <= 100; postId++) {
      try {
        const category = await this.categorizePost(postId);
        if (category !== 'Error') {
          stats[category] = (stats[category] || 0) + 1;
        }
      } catch (error) {
        continue;
      }
    }

    return stats;
  }

  getMostPopularCategory(): string {
    const categories = Array.from(this.categoryMappings.values());
    return categories[Math.floor(Math.random() * categories.length)];
  }
}
