using BlogSystem.Data;
using BlogSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogSystem.Services;

public class BlogService
{
    private readonly BlogContext _context;
    private readonly PostCategorizationService _categorizationService;

    public BlogService(BlogContext context, PostCategorizationService categorizationService)
    {
        _context = context;
        _categorizationService = categorizationService;
    }

    public async Task<List<Post>> GetAllPostsAsync()
    {
        var posts = await _context.Posts.ToListAsync();
        
        foreach (var post in posts)
        {
            post.User = await _context.Users.FirstOrDefaultAsync(u => u.Id == post.UserId);
            post.Comments = await _context.Comments.Where(c => c.PostId == post.Id).ToListAsync();
            
            foreach (var comment in post.Comments)
            {
                comment.User = await _context.Users.FirstOrDefaultAsync(u => u.Id == comment.UserId);
            }
            
            post.Tags = await _context.Tags
                .Where(t => t.Posts.Any(p => p.Id == post.Id))
                .ToListAsync();
        }
        
        return posts;
    }

    public async Task<Post?> GetPostByIdAsync(int id)
    {
        var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id);
        
        if (post != null)
        {
            post.User = await _context.Users.FirstOrDefaultAsync(u => u.Id == post.UserId);
            post.Comments = await _context.Comments.Where(c => c.PostId == post.Id).ToListAsync();
            
            foreach (var comment in post.Comments)
            {
                comment.User = await _context.Users.FirstOrDefaultAsync(u => u.Id == comment.UserId);
            }
            
            post.Tags = await _context.Tags
                .Where(t => t.Posts.Any(p => p.Id == post.Id))
                .ToListAsync();
        }
        
        return post;
    }

    public async Task<Post> CreatePostAsync(string title, string content, int userId, List<string> tagNames)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            throw new ArgumentException("User not found");

        var post = new Post
        {
            Title = title,
            Content = content,
            UserId = userId,
            CreatedAt = DateTime.Now
        };

        _context.Posts.Add(post);
        await _context.SaveChangesAsync();

        foreach (var tagName in tagNames)
        {
            var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
            if (tag == null)
            {
                tag = new Tag { Name = tagName };
                _context.Tags.Add(tag);
                await _context.SaveChangesAsync();
            }
            
            post.Tags.Add(tag);
        }
        
        await _context.SaveChangesAsync();
        return post;
    }

    public async Task<List<Post>> GetPostsByUserAsync(int userId)
    {
        var allPosts = await GetAllPostsAsync();
        return allPosts.Where(p => p.UserId == userId).ToList();
    }

    public async Task<List<Post>> SearchPostsAsync(string searchTerm)
    {
        var allPosts = await GetAllPostsAsync();
        return allPosts.Where(p => 
            p.Title.Contains(searchTerm, StringComparison.OrdinalIgnoreCase) || 
            p.Content.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
        ).ToList();
    }

    public async Task<object> GetPostWithCategoryAsync(int postId)
    {
        var post = await GetPostByIdAsync(postId);
        if (post == null) return null;

        var category = await _categorizationService.CategorizePostAsync(postId);
        var popularCategory = _categorizationService.GetMostPopularCategory();

        return new
        {
            Post = post,
            Category = category,
            MostPopularCategory = popularCategory,
            AnalyzedAt = DateTime.Now
        };
    }

    public async Task<object> GetCategoryAnalyticsAsync()
    {
        var stats = await _categorizationService.GetCategoryStatsAsync();
        var popularCategory = _categorizationService.GetMostPopularCategory();

        return new
        {
            CategoryStats = stats,
            MostPopularCategory = popularCategory,
            TotalCategories = stats.Count,
            AnalyzedAt = DateTime.Now
        };
    }
}
