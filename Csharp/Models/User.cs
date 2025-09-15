using System.ComponentModel.DataAnnotations;

namespace BlogSystem.Models;

public class User
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public List<Post> Posts { get; set; } = new();
    public List<Comment> Comments { get; set; } = new();
}
