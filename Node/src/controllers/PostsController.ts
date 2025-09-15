import { Request, Response } from 'express';
import { BlogService } from '../services/BlogService';
import { PostCategorizationService } from '../services/PostCategorizationService';
import { validatePost } from '../models/Post';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class PostsController {
  private blogService: BlogService;
  private categorizationService: PostCategorizationService;

  constructor() {
    this.blogService = new BlogService();
    this.categorizationService = new PostCategorizationService();
  }

  // ❌ PROBLEMA: Método faz muitas responsabilidades
  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      // ❌ PROBLEMA: Logging manual em arquivo
      const logEntry = {
        action: 'getAllPosts',
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        requestId: uuidv4()
      };
      
      const logPath = path.join(__dirname, '../../logs.txt');
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

      const posts = await this.blogService.getAllPosts();
      
      // ❌ PROBLEMA: Lógica de negócio no controller
      const postsWithEngagement = posts.map(post => ({
        ...post,
        engagementScore: this.calculateEngagement(post),
        isPopular: (post.comments?.length || 0) > 2
      }));

      // ❌ PROBLEMA: Filtragem de dados sensíveis no controller
      const sanitizedPosts = postsWithEngagement.map(post => ({
        ...post,
        user: post.user ? {
          id: post.user.id,
          name: post.user.name,
          email: this.maskEmail(post.user.email)
        } : null
      }));

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // ❌ PROBLEMA: Mais logging manual
      const responseLog = {
        action: 'getAllPosts_response',
        timestamp: new Date().toISOString(),
        responseTime,
        postCount: posts.length,
        requestId: logEntry.requestId
      };
      
      fs.appendFileSync(logPath, JSON.stringify(responseLog) + '\n');

      res.json({
        success: true,
        data: sanitizedPosts,
        meta: {
          count: posts.length,
          responseTime: `${responseTime}ms`
        }
      });
    } catch (error) {
      // ❌ PROBLEMA: Tratamento de erro inadequado
      console.error('Error in getAllPosts:', error);
      
      const errorLog = {
        action: 'getAllPosts_error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
      
      const logPath = path.join(__dirname, '../../errors.txt');
      fs.appendFileSync(logPath, JSON.stringify(errorLog) + '\n');

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Something went wrong while fetching posts'
      });
    }
  }

  // ❌ PROBLEMA: Duplicação de lógica de logging
  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);
      
      // ❌ PROBLEMA: Validação manual no controller
      if (isNaN(postId) || postId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid post ID',
          message: 'Post ID must be a positive number'
        });
      }

      const logEntry = {
        action: 'getPostById',
        postId,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip
      };
      
      const logPath = path.join(__dirname, '../../logs.txt');
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

      const post = await this.blogService.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
          message: `Post with ID ${postId} does not exist`
        });
      }

      // ❌ PROBLEMA: Incrementa view count no controller
      await this.incrementViewCount(postId);

      // ❌ PROBLEMA: Lógica de negócio no controller
      const postWithDetails = {
        ...post,
        engagementScore: this.calculateEngagement(post),
        isPopular: (post.comments?.length || 0) > 2,
        viewCount: await this.getViewCount(postId)
      };

      res.json({
        success: true,
        data: postWithDetails
      });
    } catch (error) {
      console.error('Error in getPostById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ❌ PROBLEMA: Método muito longo com muitas responsabilidades
  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, content, userId, tags } = req.body;

      // ❌ PROBLEMA: Validação detalhada no controller
      const postData = { title, content, userId, tags };
      const validationErrors = validatePost(postData);
      
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors
        });
      }

      // ❌ PROBLEMA: Verificação de usuário no controller
      if (!(await this.userExists(userId))) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user',
          message: 'User does not exist'
        });
      }

      // ❌ PROBLEMA: Filtro de conteúdo inadequado no controller
      const profanityWords = ['badword1', 'badword2', 'inappropriate'];
      const containsProfanity = profanityWords.some(word =>
        title.toLowerCase().includes(word) || 
        content.toLowerCase().includes(word)
      );

      if (containsProfanity) {
        return res.status(400).json({
          success: false,
          error: 'Inappropriate content',
          message: 'Content contains inappropriate language'
        });
      }

      const post = await this.blogService.createPost(postData);

      // ❌ PROBLEMA: Envio de notificação no controller
      await this.sendNotificationEmail(userId, post.id);

      // ❌ PROBLEMA: Logging manual novamente
      const logEntry = {
        action: 'createPost',
        postId: post.id,
        userId,
        timestamp: new Date().toISOString(),
        tagCount: tags?.length || 0
      };
      
      const logPath = path.join(__dirname, '../../logs.txt');
      fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

      res.status(201).json({
        success: true,
        data: post,
        message: 'Post created successfully'
      });
    } catch (error) {
      console.error('Error in createPost:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPostCategory(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);
      
      if (isNaN(postId) || postId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid post ID'
        });
      }

      const category = await this.categorizationService.categorizePost(postId);
      const popularCategory = this.categorizationService.getMostPopularCategory();

      res.json({
        success: true,
        data: {
          postId,
          category,
          mostPopularCategory: popularCategory,
          analyzedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error in getPostCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getCategoryStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.categorizationService.getCategoryStats();
      const popularCategory = this.categorizationService.getMostPopularCategory();

      res.json({
        success: true,
        data: {
          categoryStats: stats,
          mostPopularCategory: popularCategory,
          totalCategories: Object.keys(stats).length,
          analyzedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error in getCategoryStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // ❌ PROBLEMA: Métodos auxiliares que deveriam estar em services
  private calculateEngagement(post: any): number {
    const daysSinceCreation = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const commentsPerDay = (post.comments?.length || 0) / (daysSinceCreation || 1);
    const tagsWeight = (post.tags?.length || 0) * 0.5;
    
    return Math.round((commentsPerDay + tagsWeight) * 100) / 100;
  }

  private maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    const maskedUsername = username.length > 2 
      ? username.substring(0, 2) + '*'.repeat(username.length - 2)
      : username;
    return `${maskedUsername}@${domain}`;
  }

  private async userExists(userId: number): Promise<boolean> {
    // ❌ PROBLEMA: Query direta no controller
    return new Promise((resolve) => {
      const db = require('../database/connection').default.getInstance().getDb();
      db.get('SELECT id FROM users WHERE id = ?', [userId], (err: any, user: any) => {
        resolve(!!user);
      });
    });
  }

  private async incrementViewCount(postId: number): Promise<void> {
    // ❌ PROBLEMA: Gerenciamento de arquivos no controller
    const filePath = path.join(__dirname, `../../views_${postId}.txt`);
    let count = 0;
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      count = parseInt(content) || 0;
    }
    
    fs.writeFileSync(filePath, (count + 1).toString());
  }

  private async getViewCount(postId: number): Promise<number> {
    const filePath = path.join(__dirname, `../../views_${postId}.txt`);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return parseInt(content) || 0;
    }
    
    return 0;
  }

  private async sendNotificationEmail(userId: number, postId: number): Promise<void> {
    // ❌ PROBLEMA: Lógica de email no controller
    const db = require('../database/connection').default.getInstance().getDb();
    
    return new Promise((resolve) => {
      db.get('SELECT name, email FROM users WHERE id = ?', [userId], (err: any, user: any) => {
        if (user) {
          const emailContent = `Hello ${user.name}, your post ${postId} has been created successfully!`;
          const emailLog = {
            to: user.email,
            subject: 'Post Created',
            content: emailContent,
            timestamp: new Date().toISOString()
          };
          
          const emailPath = path.join(__dirname, '../../emails.txt');
          fs.appendFileSync(emailPath, JSON.stringify(emailLog) + '\n');
        }
        resolve();
      });
    });
  }
}
