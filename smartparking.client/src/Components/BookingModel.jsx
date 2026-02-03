import React, { useState, useEffect, useContext } from "react";
import "../../css/BookingModel.css";
import { FaTimes, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BookingModal({ show, onClose, parking }) {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bookingType, setBookingType] = useState("HOURLY");
    const [duration, setDuration] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [loading, setLoading] = useState(false);
    const [vehicleNumber, setVehicleNumber] = useState("");

    useEffect(() => {
        if (show) {
            const modalBox = document.querySelector(".modal-box");
            if (modalBox) modalBox.scrollTo(0, 0);
        }
    }, [show]);

    if (!show || !parking) return null;

    const hourlyRate = parking.base_rate_per_hour || 50;

    let rateLabel = "per hour";
    let totalAmount = 0;

    switch (bookingType) {
        case "HOURLY":
            totalAmount = duration * hourlyRate;
            rateLabel = "per hour";
            break;
        case "DAILY":
            totalAmount = duration * hourlyRate * 24 * 0.9;
            rateLabel = "per day";
            break;
        case "MONTHLY":
            totalAmount = hourlyRate * 24 * 30 * 0.7;
            rateLabel = "per month";
            break;
        case "QUARTERLY":
            totalAmount = hourlyRate * 24 * 90 * 0.6;
            rateLabel = "per quarter";
            break;
        default:
            break;
    }

    totalAmount = Math.round(totalAmount);

    // 🔹 Time calculation (used in payload)
    const calculateTimeRange = () => {
        const start = new Date();
        const end = new Date(start);

        if (bookingType === "HOURLY") end.setHours(end.getHours() + duration);
        if (bookingType === "DAILY") end.setDate(end.getDate() + duration);
        if (bookingType === "MONTHLY") end.setMonth(end.getMonth() + 1);
        if (bookingType === "QUARTERLY") end.setMonth(end.getMonth() + 3);

        return { start, end };
    };

    // 🔐 LOGIN REQUIRED ONLY HERE
    const handleConfirmPay = async () => {
        if (authLoading) return;

        if (!user) {
            alert("Please login to book a parking slot");
            navigate("/login");
            return;
        }

        try {
            setLoading(true);

            const { start, end } = calculateTimeRange();
            const payload = {
                userId: user.userId,                 // from AuthContext
                slotId: parking.slotId,              // parking_slots.slot_id
                vehicleNumber: vehicleNumber,        // REQUIRED
                startTime: start.toISOString(),      // ISO
                endTime: end.toISOString(),
                totalAmount: totalAmount
            };



            const res = await fetch(
                "https://localhost:7237/api/bookings/confirm",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                    credentials: "include"
                }
            );

            const text = await res.text();
            let data = {};

            try {
                data = JSON.parse(text);
            } catch {
                console.error("Non-JSON response:", text);
            }

            if (!res.ok) {
                alert(data.message || "Booking failed");
                return;
            }

            alert("Booking confirmed 🎉");
            onClose();

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">

                <button className="modal-close" onClick={onClose}>
                    <FaTimes />
                </button>

                <h2 className="modal-title">Book Parking Slot</h2>
                <p className="modal-subtitle">Complete your booking details below</p>

                {/* PARKING INFO */}
                <div className="parking-info-card">
                    <h3 className="parking-name">{parking.name}</h3>
                    <p className="parking-address">
                        <FaMapMarkerAlt /> {parking.address}
                    </p>
                    <div className="parking-meta">
                        <span className="rate-badge">₹{totalAmount}/{rateLabel}</span>
                        <span className="availability-badge">
                            {parking.availableSlots} slots available
                        </span>
                    </div>
                </div>

                {/* FORM */}
                <div className="modal-form">

                    {/* VEHICLE */}
                    <label>Vehicle Number *</label>
                    <input
                        className="modal-input"
                        placeholder="MH12AB1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                    />

                    {/* BOOKING TYPE */}
                    <label>Booking Type *</label>
                    <div className="payment-row">
                        {["HOURLY", "DAILY", "MONTHLY", "QUARTERLY"].map(type => (
                            <div
                                key={type}
                                className={`payment-box ${bookingType === type ? "selected" : ""}`}
                                onClick={() => setBookingType(type)}
                            >
                                {type}
                            </div>
                        ))}
                    </div>

                    {/* DURATION */}
                    {(bookingType === "HOURLY" || bookingType === "DAILY") && (
                        <>
                            <label>Duration *</label>
                            <div className="duration-wrapper">
                                <input
                                    type="number"
                                    min="1"
                                    className="modal-input"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                />
                                <span className="duration-tag">
                                    <FaClock /> {duration} {bookingType === "HOURLY" ? "hr" : "day"}
                                </span>
                            </div>
                        </>
                    )}

                    {/* PAYMENT METHOD */}
                    <label>Payment Method</label>
                    <div className="payment-row">
                        {["UPI", "Paytm", "Razorpay"].map(method => (
                            <div
                                key={method}
                                className={`payment-box ${paymentMethod === method ? "selected" : ""}`}
                                onClick={() => setPaymentMethod(method)}
                            >
                                {method}
                            </div>
                        ))}
                    </div>

                    {/* SUMMARY */}
                    <div className="payment-summary-box">
                        <h4>Payment Summary</h4>
                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onClose}>Cancel</button>
                    <button
                        className="pay-btn"
                        onClick={handleConfirmPay}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : `Confirm & Pay ₹${totalAmount}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
