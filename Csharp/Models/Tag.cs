using System.ComponentModel.DataAnnotations;

namespace BlogSystem.Models;

public class Tag
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(30)]
    public string Name { get; set; } = string.Empty;
    
    public List<Post> Posts { get; set; } = new();
}
