using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SmartParking.Server.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class LoginController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(
    [FromBody] LoginRequest req,
    [FromServices] IConfiguration config)
        {
            var cs = config.GetConnectionString("Postgres");

            await using var conn = new NpgsqlConnection(cs);
            await conn.OpenAsync();

            // 🔍 FETCH USER FROM DB
            var sql = """
        SELECT user_id, email, password
        FROM users
        WHERE email = @email
    """;

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("email", req.Email);

            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return Unauthorized(new { message = "Invalid credentials" });

            var userId = reader.GetGuid(0);
            var email = reader.GetString(1);
            var dbPassword = reader.GetString(2);

            // 🔐 PASSWORD VALIDATION (PLAIN FOR NOW)
            if (dbPassword != req.Password)
                return Unauthorized(new { message = "Invalid credentials" });

            // 🔑 CREATE JWT
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"])
            );

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: new[]
                {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, "User")
                },
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            Response.Cookies.Append("jwt", jwt, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,                 // REQUIRED for SameSite=None
                SameSite = SameSiteMode.None,  // 🔥 REQUIRED
                Path = "/"
            });


            return Ok(new { success = true });
        }

        [HttpGet("me")]
        public IActionResult Me()
        {
            var jwt = Request.Cookies["jwt"];
            if (jwt == null) return Unauthorized();

            var token = new JwtSecurityTokenHandler().ReadJwtToken(jwt);

            var userId = token.Claims
                .FirstOrDefault(c =>
                    c.Type == ClaimTypes.NameIdentifier || c.Type == "nameid"
                )?.Value;

            var email = token.Claims
                .FirstOrDefault(c =>
                    c.Type == ClaimTypes.Email || c.Type == "email"
                )?.Value;

            if (userId == null || email == null)
                return Unauthorized();

            return Ok(new { userId, email });
        }



        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new { success = true });
        }

    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
