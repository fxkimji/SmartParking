using Npgsql;
using SmartParking.Server.Models;

namespace SmartParking.Server.Repository
{
    public class BookingRepository
    {
        private readonly string _cs;

        public BookingRepository(IConfiguration config)
        {
            _cs = config.GetConnectionString("Postgres");
        }

        public async Task<Guid> CreateBookingAsync(CreateBookingDto dto)
        {
            var sql = @"
                INSERT INTO bookings
                (
                    user_id,
                    slot_id,
                    start_time,
                    end_time,
                    total_amount,
                    vehicle_number,
                    status
                )
                VALUES
                (
                    @userId,
                    @slotId,
                    @startTime,
                    @endTime,
                    @totalAmount,
                    @vehicleNumber,
                    'CONFIRMED'
                )
                RETURNING booking_id;
            ";

            await using var conn = new NpgsqlConnection(_cs);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("userId", dto.UserId);
            cmd.Parameters.AddWithValue("slotId", dto.SlotId);
            cmd.Parameters.AddWithValue("startTime", dto.StartTime);
            cmd.Parameters.AddWithValue("endTime", dto.EndTime);
            cmd.Parameters.AddWithValue("totalAmount", dto.TotalAmount);
            cmd.Parameters.AddWithValue("vehicleNumber", dto.VehicleNumber);



            return (Guid)await cmd.ExecuteScalarAsync();
        }

        public async Task<List<UserBookingDto>> GetBookingsByUserAsync(Guid userId)
        {
            var list = new List<UserBookingDto>();

            var sql = @"
        SELECT
            b.booking_id,
            b.vehicle_number,
            b.start_time,
            b.end_time,
            b.total_amount,
            b.status,
            ps.slot_number,
            pl.name AS parking_name
        FROM bookings b
        JOIN parking_slots ps ON ps.slot_id = b.slot_id
        JOIN parking_lots pl ON pl.lot_id = ps.lot_id
        WHERE b.user_id = @userId
        ORDER BY b.created_at DESC;
    ";

            await using var conn = new NpgsqlConnection(_cs);
            await conn.OpenAsync();

            await using var cmd = new NpgsqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("userId", userId);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(new UserBookingDto
                {
                    BookingId = reader.GetGuid(0),
                    VehicleNumber = reader.GetString(1),
                    StartTime = reader.GetDateTime(2),
                    EndTime = reader.GetDateTime(3),
                    TotalAmount = reader.GetDecimal(4),
                    Status = reader.GetString(5),
                    SlotNumber = reader.GetString(6),
                    ParkingName = reader.GetString(7)
                });
            }

            return list;
        }

    }

}
