using Microsoft.AspNetCore.Mvc;
using BlogSystem.Data;
using BlogSystem.Models;
using BlogSystem.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace BlogSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly BlogService _blogService;
    private readonly BlogContext _context;

    public PostsController(BlogService blogService, BlogContext context)
    {
        _blogService = blogService;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Post>>> GetAllPosts()
    {
        try
        {
            var posts = await _blogService.GetAllPostsAsync();
            
            var logEntry = new
            {
                Action = "GetAllPosts",
                Timestamp = DateTime.Now,
                PostCount = posts.Count,
                UserAgent = Request.Headers["User-Agent"].ToString()
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");
            
            return Ok(posts);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPost(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest("Invalid ID");
            }

            var post = await _blogService.GetPostByIdAsync(id);
            
            if (post == null)
            {
                return NotFound();
            }

            var viewCount = await GetViewCountFromFile(id);
            viewCount++;
            await SaveViewCountToFile(id, viewCount);

            var logEntry = new
            {
                Action = "GetPost",
                PostId = id,
                Timestamp = DateTime.Now,
                ViewCount = viewCount,
                UserAgent = Request.Headers["User-Agent"].ToString()
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");

            return Ok(post);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<Post>> CreatePost([FromBody] CreatePostRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Title is required");
            }

            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest("Content is required");
            }

            if (request.UserId <= 0)
            {
                return BadRequest("Valid User ID is required");
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
            {
                return BadRequest("User not found");
            }

            var profanityWords = new[] { "badword1", "badword2", "inappropriate" };
            var containsProfanity = profanityWords.Any(word => 
                request.Title.Contains(word, StringComparison.OrdinalIgnoreCase) ||
                request.Content.Contains(word, StringComparison.OrdinalIgnoreCase));

            if (containsProfanity)
            {
                return BadRequest("Content contains inappropriate language");
            }

            var post = await _blogService.CreatePostAsync(request.Title, request.Content, request.UserId, request.Tags ?? new List<string>());

            await SendNotificationEmail(request.UserId, post.Id);

            var logEntry = new
            {
                Action = "CreatePost",
                PostId = post.Id,
                UserId = request.UserId,
                Timestamp = DateTime.Now,
                TagCount = request.Tags?.Count ?? 0
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");

            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<Post>>> GetPostsByUser(int userId)
    {
        try
        {
            var posts = await _blogService.GetPostsByUserAsync(userId);
            
            var logEntry = new
            {
                Action = "GetPostsByUser",
                UserId = userId,
                Timestamp = DateTime.Now,
                PostCount = posts.Count
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");
            
            return Ok(posts);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<Post>>> SearchPosts([FromQuery] string term)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest("Search term is required");
            }

            var posts = await _blogService.SearchPostsAsync(term);
            
            var logEntry = new
            {
                Action = "SearchPosts",
                SearchTerm = term,
                Timestamp = DateTime.Now,
                ResultCount = posts.Count
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");
            
            return Ok(posts);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}/category")]
    public async Task<ActionResult<object>> GetPostCategory(int id)
    {
        try
        {
            var result = await _blogService.GetPostWithCategoryAsync(id);
            
            if (result == null)
                return NotFound();
            
            var logEntry = new
            {
                Action = "GetPostCategory",
                PostId = id,
                Timestamp = DateTime.Now
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("categories/analytics")]
    public async Task<ActionResult<object>> GetCategoryAnalytics()
    {
        try
        {
            var analytics = await _blogService.GetCategoryAnalyticsAsync();
            
            var logEntry = new
            {
                Action = "GetCategoryAnalytics",
                Timestamp = DateTime.Now
            };
            
            await System.IO.File.AppendAllTextAsync("logs.txt", JsonSerializer.Serialize(logEntry) + "\n");
            
            return Ok(analytics);
        }
        catch (Exception ex)
        {
            await System.IO.File.AppendAllTextAsync("errors.txt", $"{DateTime.Now}: {ex.Message}\n");
            return StatusCode(500, "Internal server error");
        }
    }

    private async Task<int> GetViewCountFromFile(int postId)
    {
        var filePath = $"views_{postId}.txt";
        if (System.IO.File.Exists(filePath))
        {
            var content = await System.IO.File.ReadAllTextAsync(filePath);
            if (int.TryParse(content, out var count))
            {
                return count;
            }
        }
        return 0;
    }

    private async Task SaveViewCountToFile(int postId, int count)
    {
        var filePath = $"views_{postId}.txt";
        await System.IO.File.WriteAllTextAsync(filePath, count.ToString());
    }

    private async Task SendNotificationEmail(int userId, int postId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user != null)
        {
            var emailContent = $"Hello {user.Name}, your post {postId} has been created successfully!";
            await System.IO.File.AppendAllTextAsync("emails.txt", $"{DateTime.Now}: {emailContent}\n");
        }
    }
}

public class CreatePostRequest
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int UserId { get; set; }
    public List<string>? Tags { get; set; }
}
