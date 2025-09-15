using BlogSystem.Data;
using BlogSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BlogSystem.Services;

public class PostAnalyticsService
{
    private readonly BlogContext _context;
    private readonly ILogger<PostAnalyticsService> _logger;

    public PostAnalyticsService(BlogContext context, ILogger<PostAnalyticsService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Post?> GetPostWithAnalyticsAsync(int postId)
    {
        _logger.LogInformation("Getting post {PostId} with analytics", postId);
        
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
            .ThenInclude(c => c.User)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == postId);
    }

    public async Task<List<Post>> GetAllPostsWithAnalyticsAsync()
    {
        _logger.LogInformation("Getting all posts with analytics");
        
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Comments)
            .ThenInclude(c => c.User)
            .Include(p => p.Tags)
            .ToListAsync();
    }

    public async Task<object> GetPostMetricsAsync(int postId)
    {
        _logger.LogInformation("Calculating metrics for post {PostId}", postId);
        
        var post = await _context.Posts
            .Include(p => p.Comments)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == postId);
            
        if (post == null) return null;
        
        return new
        {
            PostId = postId,
            Title = post.Title,
            CommentCount = post.Comments.Count,
            TagCount = post.Tags.Count,
            CreatedAt = post.CreatedAt,
            AnalyzedAt = DateTime.Now
        };
    }

    public async Task<object> GetUserPostStatsAsync(int userId)
    {
        _logger.LogInformation("Calculating stats for user {UserId}", userId);
        
        var posts = await _context.Posts
            .Where(p => p.UserId == userId)
            .Include(p => p.Comments)
            .Include(p => p.Tags)
            .ToListAsync();
        
        return new
        {
            UserId = userId,
            TotalPosts = posts.Count,
            TotalComments = posts.Sum(p => p.Comments.Count),
            TotalTags = posts.SelectMany(p => p.Tags).Distinct().Count(),
            AnalyzedAt = DateTime.Now
        };
    }

    public double CalculateEngagementScore(Post post)
    {
        _logger.LogDebug("Calculating engagement score for post {PostId}", post.Id);
        
        var daysSinceCreation = (DateTime.Now - post.CreatedAt).TotalDays;
        if (daysSinceCreation == 0) daysSinceCreation = 1;
        
        var commentsPerDay = post.Comments.Count / daysSinceCreation;
        var tagsWeight = post.Tags.Count * 0.5;
        
        return Math.Round(commentsPerDay + tagsWeight, 2);
    }
}
