import { PostAnalyticsService } from './PostAnalyticsService';
import { Post } from '../models/Post';

// ❌ PROBLEMA: Serviço que depende de Singleton, criando acoplamento forte
export class PostCategorizationService {
  private analyticsService: PostAnalyticsService;
  private categoryMappings: Map<string, string>;

  constructor() {
    // ❌ PROBLEMA: Dependência direta de singleton
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
      // ❌ PROBLEMA: Usa o singleton que pode ter problemas de concorrência
      const metrics = await this.analyticsService.getPostMetrics(postId);
      
      if (!metrics) {
        return 'Uncategorized';
      }

      // ❌ PROBLEMA: Lógica de categorização muito simplista
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

  // ❌ PROBLEMA: Método que faz múltiplas chamadas para o mesmo serviço
  async getCategoryStats(): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {};
    
    // ❌ PROBLEMA: Não tem como saber quantos posts existem sem query adicional
    // Assume que há posts com IDs de 1 a 100
    for (let postId = 1; postId <= 100; postId++) {
      try {
        const category = await this.categorizePost(postId);
        if (category !== 'Error') {
          stats[category] = (stats[category] || 0) + 1;
        }
      } catch (error) {
        // ❌ PROBLEMA: Ignora erros silenciosamente
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
