using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class ParkingSpot
    {
        // 🔑 DB keys
        public Guid LotId { get; set; }
        public Guid SlotId { get; set; }

        // 📍 Location details
        public string Name { get; set; }
        public string Address { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        // 💰 Pricing
        public decimal base_rate_per_hour { get; set; }

        // 📏 Calculated (not DB column)
        public double DistanceKm { get; set; }
    }
}
