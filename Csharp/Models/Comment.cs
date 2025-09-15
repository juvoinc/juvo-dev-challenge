using System.ComponentModel.DataAnnotations;

namespace BlogSystem.Models;

public class Comment
{
    public int Id { get; set; }
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
}
