using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace SmartParking.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class LoginController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest req)
        {
            // Dummy user check (replace with SQL later)
            if (req.Email != "test@gmail.com" || req.Password != "123456")
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Create JWT
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("THIS_IS_SUPER_SECRET_KEY_123"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: new[]
                {
                    new Claim(ClaimTypes.Email, req.Email),
                    new Claim(ClaimTypes.Role, "User")
                },
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            // Add as HttpOnly cookie
            Response.Cookies.Append("jwt", jwt, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None
            });

            return Ok(new { success = true });
        }


        [HttpGet("me")]
        public IActionResult Me()
        {
            var jwt = Request.Cookies["jwt"];
            if (jwt == null) return Unauthorized();

            return Ok(new { message = "User authenticated" });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
