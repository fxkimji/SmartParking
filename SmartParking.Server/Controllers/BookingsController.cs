using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartParking.Server.Models;
using SmartParking.Server.Repository;
using System.Security.Claims;

namespace SmartParking.Server.Controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly BookingRepository _repo;

        public BookingController(BookingRepository repo)
        {
            _repo = repo;
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> Confirm([FromBody] CreateBookingDto dto)
        {
            try
            {
                var bookingId = await _repo.CreateBookingAsync(dto);
                return Ok(new { bookingId, status = "CONFIRMED" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim);

            var bookings = await _repo.GetBookingsByUserAsync(userId);
            return Ok(bookings);
        }
    }

}
