using Microsoft.AspNetCore.Mvc;
using Backend.Models;
using SmartParking.Server.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/parking")]
    public class ParkingController : ControllerBase
    {
        private readonly IParkingService _service;

        public ParkingController(IParkingService service)
        {
            _service = service;
        }

        [HttpPost("by-bounds")]
        public async Task<IActionResult> GetByBounds([FromBody] BoundsRequest req)
        {
            var result = await _service.GetByBoundsAsync(req);
            return Ok(result);
        }

        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearby(
            [FromQuery] double lat,
            [FromQuery] double lng,
            [FromQuery] int radius = 3
        )
        {
            var result = await _service.GetNearbyAsync(lat, lng, radius);
            return Ok(result);
        }
    }
}
