# 📝 SISTEMA DE BLOG - NODE.JS - TESTE TÉCNICO

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- IDE de sua preferência (VS Code, WebStorm, etc.)

### Executando o Projeto
```bash
# Clone ou baixe o projeto
cd blog-system-node

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Ou compilar e executar
npm run build
npm start
```

### 🌐 Endpoints Disponíveis

Após executar, acesse: `http://localhost:3000`

**Principais endpoints:**
- `GET /api/posts` - Listar todos os posts
- `GET /api/posts/{id}` - Obter post específico
- `POST /api/posts` - Criar novo post
- `GET /api/posts/{id}/category` - Categorizar post específico
- `GET /api/posts/categories/stats` - Estatísticas de categorias
- `GET /health` - Health check da aplicação

### 📊 Dados de Exemplo

O projeto já vem com dados pré-carregados no SQLite:
- **3 usuários** (João, Maria, Carlos)
- **5 posts** sobre tecnologia
- **5 comentários** nos posts
- **5 tags** (Tecnologia, Programação, JavaScript, etc.)

### 📋 Exemplo de Requisição POST

```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Novo Post",
    "content": "Conteúdo do meu post sobre Node.js",
    "userId": 1,
    "tags": ["nodejs", "javascript"]
  }'
```

## 🎯 OBJETIVO DO TESTE

**Analise este código e identifique:**

1. ✅ **Pontos Fortes** - O que está bem implementado?
2. ❌ **Pontos Fracos** - Quais problemas você identifica?
3. 🔧 **Melhorias** - Como você corrigiria os problemas?
4. 🏗️ **Arquitetura** - Que mudanças arquiteturais sugere?

### ⏱️ Tempo Sugerido
- **15-20 minutos** para análise do código
- **5 minutos** para discussão das descobertas

### 🛠️ Tecnologias Utilizadas
- **Node.js** com TypeScript
- **Express.js** para API REST
- **SQLite** para banco de dados
- **Winston** para logging (configurado)
- **Helmet** para segurança básica
- **CORS** para cross-origin requests

---

## 💡 Dicas para Análise

1. **Examine os Controllers** - Como estão estruturados?
2. **Analise os Services** - Como fazem acesso aos dados?
3. **Observe o Database** - Configurações e queries
4. **Avalie os Models** - Estrutura e validações
5. **Considere Performance** - Quantas queries são executadas?
6. **Teste os endpoints** - Funcionam corretamente?
7. **Verifique Segurança** - Há vulnerabilidades?

**Boa análise!** 🔍
