using Backend.Models;

namespace SmartParking.Server.Services
{
    public interface IParkingService
    {
        Task<List<ParkingSpot>> GetByBoundsAsync(BoundsRequest bounds);
        Task<List<ParkingSpot>> GetNearbyAsync(double lat, double lng, int radius);
    }

}
