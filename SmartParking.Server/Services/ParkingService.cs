using Backend.Models;
using SmartParking.Server.Repository;
using SmartParking.Server.Services;

public class ParkingService : IParkingService
{
    private readonly IParkingRepository _repo;

    public ParkingService(IParkingRepository repo)
    {
        _repo = repo;
    }

    public Task<List<ParkingSpot>> GetByBoundsAsync(BoundsRequest req)
        => _repo.GetByBoundsAsync(req);

    public Task<List<ParkingSpot>> GetNearbyAsync(double lat, double lng, int radiusKm)
        => _repo.GetNearbyAsync(lat, lng, radiusKm);
}
