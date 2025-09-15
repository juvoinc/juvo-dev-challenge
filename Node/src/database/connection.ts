import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

// ❌ PROBLEMA: Singleton mal implementado - não thread-safe
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private db: Database;

  private constructor() {
    const dbPath = path.join(__dirname, '../../blog.db');
    
    // ❌ PROBLEMA: Não trata erros de conexão adequadamente
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      } else {
        console.log('Connected to SQLite database');
      }
    });
    
    this.initializeTables();
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public getDb(): Database {
    return this.db;
  }

  // ❌ PROBLEMA: Inicialização síncrona de tabelas em construtor assíncrono
  private initializeTables(): void {
    const createTables = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        userId INTEGER NOT NULL,
        postId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (postId) REFERENCES posts (id)
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_tags (
        postId INTEGER NOT NULL,
        tagId INTEGER NOT NULL,
        PRIMARY KEY (postId, tagId),
        FOREIGN KEY (postId) REFERENCES posts (id),
        FOREIGN KEY (tagId) REFERENCES tags (id)
      );
    `;

    // ❌ PROBLEMA: Executa múltiplas queries sem controle de transação
    this.db.exec(createTables, (err) => {
      if (err) {
        console.error('Error creating tables:', err.message);
      } else {
        console.log('Tables created successfully');
        this.seedDatabase();
      }
    });
  }

  // ❌ PROBLEMA: Seed sem verificar se dados já existem
  private seedDatabase(): void {
    const seedData = `
      INSERT OR IGNORE INTO users (name, email, password) VALUES
        ('João Silva', 'joao@email.com', '123456'),
        ('Maria Santos', 'maria@email.com', 'password'),
        ('Carlos Oliveira', 'carlos@email.com', 'qwerty');

      INSERT OR IGNORE INTO tags (name) VALUES
        ('Tecnologia'),
        ('Programação'),
        ('JavaScript'),
        ('Node.js'),
        ('Tutorial');

      INSERT OR IGNORE INTO posts (title, content, userId) VALUES
        ('Introdução ao Node.js', 'Node.js é uma plataforma...', 1),
        ('Express.js Fundamentals', 'Express é um framework...', 1),
        ('TypeScript com Node', 'TypeScript adiciona tipagem...', 2),
        ('Performance em Node.js', 'Dicas para otimizar...', 2),
        ('Async/Await Best Practices', 'Como usar async/await...', 3);

      INSERT OR IGNORE INTO comments (content, userId, postId) VALUES
        ('Excelente artigo!', 2, 1),
        ('Muito útil, obrigado!', 3, 1),
        ('Poderia dar mais exemplos?', 1, 3),
        ('Ótimas dicas de performance!', 1, 4),
        ('Async/await é essencial!', 2, 5);

      INSERT OR IGNORE INTO post_tags (postId, tagId) VALUES
        (1, 1), (1, 4),
        (2, 1), (2, 4),
        (3, 1), (3, 3), (3, 4),
        (4, 1), (4, 4),
        (5, 1), (5, 3), (5, 5);
    `;

    this.db.exec(seedData, (err) => {
      if (err) {
        console.error('Error seeding database:', err.message);
      } else {
        console.log('Database seeded successfully');
      }
    });
  }

  // ❌ PROBLEMA: Método close sem cleanup adequado
  public close(): void {
    this.db.close();
  }
}

export default DatabaseConnection;
