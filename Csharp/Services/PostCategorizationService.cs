using BlogSystem.Models;

namespace BlogSystem.Services;

public class PostCategorizationService
{
    private readonly PostAnalyticsService _analyticsService;
    private readonly Dictionary<string, string> _categoryMappings;

    public PostCategorizationService(PostAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
        
        _categoryMappings = new Dictionary<string, string>
        {
            { "tecnologia", "Tech" },
            { "programação", "Programming" },
            { "c#", "Programming" },
            { "web development", "Web" },
            { "tutorial", "Educational" },
            { "performance", "Optimization" },
            { "arquitetura", "Architecture" },
            { "clean", "Best Practices" }
        };
    }

    public async Task<string> CategorizePostAsync(int postId)
    {
        var post = await _analyticsService.GetPostWithAnalyticsAsync(postId);
        
        if (post == null)
            return "Uncategorized";

        var categories = new List<string>();
        
        foreach (var tag in post.Tags)
        {
            var tagLower = tag.Name.ToLowerInvariant();
            
            foreach (var mapping in _categoryMappings)
            {
                if (tagLower.Contains(mapping.Key))
                {
                    if (!categories.Contains(mapping.Value))
                        categories.Add(mapping.Value);
                }
            }
        }

        if (categories.Count == 0)
            return "General";

        return string.Join(", ", categories);
    }

    public async Task<Dictionary<string, int>> GetCategoryStatsAsync()
    {
        var allPosts = await _analyticsService.GetAllPostsWithAnalyticsAsync();
        var stats = new Dictionary<string, int>();

        foreach (var post in allPosts)
        {
            var category = await CategorizePostAsync(post.Id);
            
            if (stats.ContainsKey(category))
                stats[category]++;
            else
                stats[category] = 1;
        }

        return stats;
    }

    public string GetMostPopularCategory()
    {
        var categories = _categoryMappings.Values.Distinct().ToList();
        return categories.OrderBy(x => Guid.NewGuid()).First();
    }
}
