using System.ComponentModel.DataAnnotations;

namespace BlogSystem.Models;

public class Post
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public List<Comment> Comments { get; set; } = new();
    public List<Tag> Tags { get; set; } = new();
}
