using Backend.Models;
using Npgsql;

namespace SmartParking.Server.Repository
{
    public class ParkingRepository : IParkingRepository
    {
        private readonly string _cs;

        public ParkingRepository(IConfiguration config)
        {
            _cs = config.GetConnectionString("Postgres");

            if (string.IsNullOrWhiteSpace(_cs))
                throw new Exception("Postgres connection string not found");
        }

        // 🔹 Nearby parking (map search)
        public async Task<List<ParkingSpot>> GetNearbyAsync(
            double lat, double lng, int radiusKm)
        {
            var list = new List<ParkingSpot>();

            var sql = """
                SELECT *
                FROM (
                    SELECT
                        p.lot_id,
                        s.slot_id,
                        p.name,
                        p.address,
                        p.latitude,
                        p.longitude,
                        p.base_rate_per_hour,
                        (
                            6371 * acos(
                                cos(radians(@lat)) *
                                cos(radians(p.latitude)) *
                                cos(radians(p.longitude) - radians(@lng)) +
                                sin(radians(@lat)) *
                                sin(radians(p.latitude))
                            )
                        ) AS distance
                    FROM parking_lots p
                    JOIN parking_slots s ON s.lot_id = p.lot_id
                    WHERE
                        p.is_active = true
                        AND s.is_maintenance = false
                ) AS nearby
                WHERE distance <= @radius
                ORDER BY distance;
                """;


            await using var conn = new NpgsqlConnection(_cs);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("lat", lat);
            cmd.Parameters.AddWithValue("lng", lng);
            cmd.Parameters.AddWithValue("radius", radiusKm);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new ParkingSpot
                {
                    LotId = reader.GetGuid(0),
                    SlotId = reader.GetGuid(1),
                    Name = reader.GetString(2),
                    Address = reader.GetString(3),
                    Latitude = (double)reader.GetDecimal(4),
                    Longitude = (double)reader.GetDecimal(5),
                    base_rate_per_hour = reader.GetDecimal(6),
                    DistanceKm = reader.GetDouble(7)
                });
            }

            return list;
        }

        // 🔹 Parking inside map bounds
        public async Task<List<ParkingSpot>> GetByBoundsAsync(BoundsRequest req)
        {
            var list = new List<ParkingSpot>();

            var sql = """
                SELECT
                    p.lot_id,
                    s.slot_id,
                    p.name,
                    p.address,
                    p.latitude,
                    p.longitude,
                    p.base_rate_per_hour
                FROM parking_lots p
                JOIN parking_slots s ON s.lot_id = p.lot_id
                WHERE
                    p.is_active = true
                    AND s.is_maintenance = false
                    AND p.latitude BETWEEN @south AND @north
                    AND p.longitude BETWEEN @west AND @east;
            """;

            await using var conn = new NpgsqlConnection(_cs);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("north", req.NorthLat);
            cmd.Parameters.AddWithValue("south", req.SouthLat);
            cmd.Parameters.AddWithValue("east", req.EastLng);
            cmd.Parameters.AddWithValue("west", req.WestLng);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new ParkingSpot
                {
                    LotId = reader.GetGuid(0),
                    SlotId = reader.GetGuid(1),
                    Name = reader.GetString(2),
                    Address = reader.GetString(3),
                    Latitude = (double)reader.GetDecimal(4),
                    Longitude = (double)reader.GetDecimal(5),
                    base_rate_per_hour = reader.GetDecimal(6)
                });
            }

            return list;
        }
    }
}
