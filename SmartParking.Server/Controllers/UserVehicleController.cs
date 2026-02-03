using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Security.Claims;

namespace SmartParking.Server.Controllers
{
    [ApiController]
    [Route("api/vehicles")]
    [Authorize]
    public class UserVehicleController : ControllerBase
    {
        private readonly IConfiguration _config;

        public UserVehicleController(IConfiguration config)
        {
            _config = config;
        }

        // 🔹 GET vehicles
        [HttpGet]
        public async Task<IActionResult> GetVehicles()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            await using var conn = new NpgsqlConnection(_config.GetConnectionString("Postgres"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("""
                SELECT vehicle_id, vehicle_number
                FROM user_vehicles
                WHERE user_id = @uid
            """, conn);

            cmd.Parameters.AddWithValue("uid", Guid.Parse(userId));

            var list = new List<object>();
            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                list.Add(new
                {
                    vehicleId = reader.GetGuid(0),
                    vehicleNumber = reader.GetString(1)
                });
            }

            return Ok(list);
        }

        // 🔹 ADD vehicle
        [HttpPost]
        public async Task<IActionResult> AddVehicle([FromBody] AddVehicleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.VehicleNumber))
                return BadRequest("Vehicle number required");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await using var conn = new NpgsqlConnection(_config.GetConnectionString("Postgres"));
            await conn.OpenAsync();

            // 🚫 prevent duplicates
            var checkCmd = new NpgsqlCommand("""
                SELECT 1 FROM user_vehicles
                WHERE user_id = @uid AND vehicle_number = @vehicle
            """, conn);

            checkCmd.Parameters.AddWithValue("uid", Guid.Parse(userId));
            checkCmd.Parameters.AddWithValue("vehicle", dto.VehicleNumber.ToUpper());

            if (await checkCmd.ExecuteScalarAsync() != null)
                return BadRequest("Vehicle already exists");

            var cmd = new NpgsqlCommand("""
                INSERT INTO user_vehicles (user_id, vehicle_number)
                VALUES (@uid, @vehicle)
            """, conn);

            cmd.Parameters.AddWithValue("uid", Guid.Parse(userId));
            cmd.Parameters.AddWithValue("vehicle", dto.VehicleNumber.ToUpper());

            await cmd.ExecuteNonQueryAsync();
            return Ok();
        }

        // 🔹 UPDATE vehicle ✅
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVehicle(Guid id, [FromBody] AddVehicleDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.VehicleNumber))
                return BadRequest("Vehicle number required");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await using var conn = new NpgsqlConnection(_config.GetConnectionString("Postgres"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("""
                UPDATE user_vehicles
                SET vehicle_number = @vehicle
                WHERE vehicle_id = @vid AND user_id = @uid
            """, conn);

            cmd.Parameters.AddWithValue("vehicle", dto.VehicleNumber.ToUpper());
            cmd.Parameters.AddWithValue("vid", id);
            cmd.Parameters.AddWithValue("uid", Guid.Parse(userId));

            var rows = await cmd.ExecuteNonQueryAsync();
            if (rows == 0) return BadRequest("Update failed");

            return Ok();
        }

        // 🔹 DELETE vehicle ✅
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVehicle(Guid id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            await using var conn = new NpgsqlConnection(_config.GetConnectionString("Postgres"));
            await conn.OpenAsync();

            var cmd = new NpgsqlCommand("""
                DELETE FROM user_vehicles
                WHERE vehicle_id = @vid AND user_id = @uid
            """, conn);

            cmd.Parameters.AddWithValue("vid", id);
            cmd.Parameters.AddWithValue("uid", Guid.Parse(userId));

            await cmd.ExecuteNonQueryAsync();
            return Ok();
        }
    }

    public class AddVehicleDto
    {
        public string VehicleNumber { get; set; }
    }
}
