namespace SmartParking.Server.Models
{
    public class CreateBookingDto
    {
        public Guid UserId { get; set; }
        public Guid SlotId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalAmount { get; set; }
        public string VehicleNumber { get; set; }
    }
    public class UserBookingDto
    {
        public Guid BookingId { get; set; }
        public string VehicleNumber { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }

        public string SlotNumber { get; set; }
        public string ParkingName { get; set; }
    }

}
