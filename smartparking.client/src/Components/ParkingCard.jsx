import React from "react";
import "../../css/ParkingCard.css";
import { FaMapMarkerAlt, FaStar, FaMotorcycle, FaCar, FaClock } from "react-icons/fa";

export default function ParkingCard({ data, onBook }) {
    return (
        <div className="parking-card">
            <div className="card-image">
                <img src={data.imageUrl} alt="Parking" />
                <span className="distance-badge"> {data.distance && `${Number(data.distance).toFixed(1)} km`} </span>
                <div className="card-title">{data.name}</div>
            </div>

            <div className="color-divider"></div>

            <div className="card-content">

                <p className="address">
                    <FaMapMarkerAlt /> {data.address}
                </p>
                <div className="info-row">
                    <div className="info-badge price">
                        ₹{data.base_rate_per_hour}/hr
                    </div>

                    <div className="info-badge availability">
                        {data.availableSlots} / {data.totalSlots} Available
                    </div>

                    <div className="info-badge rating">
                        <FaStar /> {data.rating}
                    </div>
                </div>

                <div className="vehicle-row">
                    <span className="vehicle-badge"><FaMotorcycle /> 2W</span>
                    <span className="vehicle-badge"><FaCar /> 4W</span>
                </div>

                <button
                    className="book-btn"
                    onClick={() => onBook(data)}
                >
                    Book Now
                </button>

            </div>
        </div>
    );
}
