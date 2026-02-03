using Backend.Models;

namespace SmartParking.Server.Repository
{
    public interface IParkingRepository
    {
        Task<List<ParkingSpot>> GetNearbyAsync(double lat, double lng, int radiusKm);
        Task<List<ParkingSpot>> GetByBoundsAsync(BoundsRequest req);
    }
}
