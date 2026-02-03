using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Security.Claims;

namespace SmartParking.Server.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IConfiguration _config;

        public UserController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await using var conn = new NpgsqlConnection(_config.GetConnectionString("Postgres"));
            await conn.OpenAsync();

            var userSql = """
                SELECT user_id, full_name, email
                FROM users
                WHERE user_id = @id
            """;

            await using var userCmd = new NpgsqlCommand(userSql, conn);
            userCmd.Parameters.AddWithValue("id", Guid.Parse(userId));

            await using var reader = await userCmd.ExecuteReaderAsync();
            await reader.ReadAsync();

            var user = new
            {
                userId = reader.GetGuid(0),
                fullName = reader.GetString(1),
                email = reader.GetString(2)
            };

            await reader.CloseAsync();

            var bookingSql = """
                SELECT start_time, end_time, total_amount, status, vehicle_number
                FROM bookings
                WHERE user_id = @id
                ORDER BY created_at DESC
            """;

            await using var bookCmd = new NpgsqlCommand(bookingSql, conn);
            bookCmd.Parameters.AddWithValue("id", Guid.Parse(userId));

            var bookings = new List<object>();
            await using var br = await bookCmd.ExecuteReaderAsync();

            while (await br.ReadAsync())
            {
                bookings.Add(new
                {
                    startTime = br.GetDateTime(0),
                    endTime = br.GetDateTime(1),
                    totalAmount = br.GetDecimal(2),
                    status = br.GetString(3),
                    vehicleNumber = br.GetString(4)
                });
            }

            return Ok(new { user, bookings });
        }
    }
}
