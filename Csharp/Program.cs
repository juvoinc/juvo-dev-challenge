using BlogSystem.Data;
using BlogSystem.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<BlogContext>(options =>
    options.UseInMemoryDatabase("BlogSystemDb"));

builder.Services.AddSingleton<PostCategorizationService>();

builder.Services.AddScoped<BlogService>();
builder.Services.AddScoped<PostAnalyticsService>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Seed database with sample data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<BlogContext>();
    SeedDatabase(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

static void SeedDatabase(BlogContext context)
{
    if (context.Users.Any()) return; // Database already seeded

    // Create sample users
    var users = new[]
    {
        new BlogSystem.Models.User { Id = 1, Name = "João Silva", Email = "joao@email.com", Password = "123456", CreatedAt = DateTime.Now.AddDays(-30) },
        new BlogSystem.Models.User { Id = 2, Name = "Maria Santos", Email = "maria@email.com", Password = "password", CreatedAt = DateTime.Now.AddDays(-20) },
        new BlogSystem.Models.User { Id = 3, Name = "Carlos Oliveira", Email = "carlos@email.com", Password = "qwerty", CreatedAt = DateTime.Now.AddDays(-15) }
    };
    context.Users.AddRange(users);

    // Create sample tags
    var tags = new[]
    {
        new BlogSystem.Models.Tag { Id = 1, Name = "Tecnologia" },
        new BlogSystem.Models.Tag { Id = 2, Name = "Programação" },
        new BlogSystem.Models.Tag { Id = 3, Name = "C#" },
        new BlogSystem.Models.Tag { Id = 4, Name = "Web Development" },
        new BlogSystem.Models.Tag { Id = 5, Name = "Tutorial" }
    };
    context.Tags.AddRange(tags);

    context.SaveChanges();

    // Create sample posts
    var posts = new[]
    {
        new BlogSystem.Models.Post { Id = 1, Title = "Introdução ao C#", Content = "C# é uma linguagem de programação...", UserId = 1, CreatedAt = DateTime.Now.AddDays(-10) },
        new BlogSystem.Models.Post { Id = 2, Title = "Entity Framework Core", Content = "EF Core é um ORM moderno...", UserId = 1, CreatedAt = DateTime.Now.AddDays(-8) },
        new BlogSystem.Models.Post { Id = 3, Title = "ASP.NET Core Web API", Content = "Criando APIs REST com ASP.NET Core...", UserId = 2, CreatedAt = DateTime.Now.AddDays(-5) },
        new BlogSystem.Models.Post { Id = 4, Title = "Performance em .NET", Content = "Dicas para otimizar aplicações .NET...", UserId = 2, CreatedAt = DateTime.Now.AddDays(-3) },
        new BlogSystem.Models.Post { Id = 5, Title = "Clean Architecture", Content = "Princípios de arquitetura limpa...", UserId = 3, CreatedAt = DateTime.Now.AddDays(-1) }
    };
    context.Posts.AddRange(posts);

    context.SaveChanges();

    // Create sample comments
    var comments = new[]
    {
        new BlogSystem.Models.Comment { Id = 1, Content = "Excelente artigo!", UserId = 2, PostId = 1, CreatedAt = DateTime.Now.AddDays(-9) },
        new BlogSystem.Models.Comment { Id = 2, Content = "Muito útil, obrigado!", UserId = 3, PostId = 1, CreatedAt = DateTime.Now.AddDays(-9) },
        new BlogSystem.Models.Comment { Id = 3, Content = "Poderia dar mais exemplos?", UserId = 1, PostId = 3, CreatedAt = DateTime.Now.AddDays(-4) },
        new BlogSystem.Models.Comment { Id = 4, Content = "Ótimas dicas de performance!", UserId = 1, PostId = 4, CreatedAt = DateTime.Now.AddDays(-2) },
        new BlogSystem.Models.Comment { Id = 5, Content = "Clean Architecture é essencial!", UserId = 2, PostId = 5, CreatedAt = DateTime.Now.AddHours(-12) }
    };
    context.Comments.AddRange(comments);

    context.SaveChanges();
}
