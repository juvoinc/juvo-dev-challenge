# 📝 SISTEMA DE BLOG - TESTE TÉCNICO

## 🚀 Como Executar o Projeto

### Pré-requisitos
- .NET 8 SDK instalado
- IDE de sua preferência (Visual Studio, VS Code, Rider)

### Executando o Projeto
```bash
# Clone ou baixe o projeto
cd BlogSystem

# Restaurar dependências
dotnet restore

# Executar o projeto
dotnet run
```

### 🌐 Endpoints Disponíveis

Após executar, acesse: `https://localhost:7XXX/swagger` para ver a documentação da API

**Principais endpoints:**
- `GET /api/posts` - Listar todos os posts
- `GET /api/posts/{id}` - Obter post específico
- `POST /api/posts` - Criar novo post
- `GET /api/posts/user/{userId}` - Posts de um usuário
- `GET /api/posts/search?term=texto` - Buscar posts
- `GET /api/posts/{id}/category` - Post com categoria e análise
- `GET /api/posts/categories/analytics` - Analytics completo de categorias

### 📊 Dados de Exemplo

O projeto já vem com dados pré-carregados:
- **3 usuários** (João, Maria, Carlos)
- **5 posts** sobre tecnologia
- **5 comentários** nos posts
- **5 tags** (Tecnologia, Programação, C#, etc.)

## 🎯 OBJETIVO DO TESTE

**Analise este código e identifique:**

1. ✅ **Pontos Fortes** - O que está bem implementado?
2. ❌ **Pontos Fracos** - Quais problemas você identifica?
3. 🔧 **Melhorias** - Como você corrigiria os problemas?
4. 🏗️ **Arquitetura** - Que mudanças arquiteturais sugere?

### ⏱️ Tempo Sugerido
- **15-20 minutos** para análise do código
- **10 minutos** para discussão das descobertas

### 📋 Foque Especialmente Em:
- Performance e otimização de queries
- Responsabilidades e separação de camadas
- Padrões de design e boas práticas
- Segurança e validações
- Manutenibilidade do código

---

## 💡 Dicas para Análise

1. **Examine os Controllers** - Como estão estruturados?
2. **Analise os Services** - Como fazem acesso aos dados?
3. **Observe o DbContext** - Configurações e relacionamentos
4. **Avalie os Models** - Estrutura e validações
5. **Considere Performance** - Quantas queries são executadas?

**Boa análise!** 🔍
