import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/ProfilePage.css";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newVehicle, setNewVehicle] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        await Promise.all([loadProfile(), loadVehicles(), loadBookings()]);
    };

    const loadProfile = async () => {
        const res = await fetch("https://localhost:7237/api/users/me", {
            credentials: "include",
        });
        if (!res.ok) return navigate("/login");
        setUser(await res.json());
    };

    const loadVehicles = async () => {
        const res = await fetch("https://localhost:7237/api/vehicles", {
            credentials: "include",
        });
        if (res.ok) setVehicles(await res.json());
    };

    const loadBookings = async () => {
        const res = await fetch("https://localhost:7237/api/bookings/my", {
            credentials: "include",
        });
        if (res.ok) setBookings(await res.json());
    };

    /* ---------------- VEHICLES ---------------- */

    const addVehicle = async () => {
        if (!newVehicle.trim()) return alert("Vehicle number required");

        const exists = vehicles.some(
            v => v.vehicleNumber === newVehicle.toUpperCase()
        );
        if (exists) return alert("Vehicle already exists");

        const res = await fetch("https://localhost:7237/api/vehicles", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleNumber: newVehicle }),
        });

        if (!res.ok) return alert("Failed to add vehicle");

        setVehicles([...vehicles, { vehicleNumber: newVehicle.toUpperCase() }]);
        setNewVehicle("");
    };

    const deleteVehicle = async (id) => {
        if (!window.confirm("Delete this vehicle?")) return;

        await fetch(`https://localhost:7237/api/vehicles/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        setVehicles(vehicles.filter(v => v.vehicleId !== id));
    };

    const saveEdit = async (id) => {
        if (!editingValue.trim()) return alert("Vehicle number required");

        const exists = vehicles.some(
            v =>
                v.vehicleNumber === editingValue.toUpperCase() &&
                v.vehicleId !== id
        );
        if (exists) return alert("Duplicate vehicle number");

        const res = await fetch(`https://localhost:7237/api/vehicles/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vehicleNumber: editingValue }),
        });

        if (!res.ok) return alert("Update failed");

        setVehicles(
            vehicles.map(v =>
                v.vehicleId === id
                    ? { ...v, vehicleNumber: editingValue.toUpperCase() }
                    : v
            )
        );
        setEditingId(null);
        setEditingValue("");
    };

    if (!user) return <p className="loading">Loading...</p>;

    return (
        <div className="profile-bg">
            <div className="profile-card">
                <h2 className="profile-title">My Profile</h2>

                {/* USER */}
                <div className="section">
                    <label>Email</label>
                    <p className="value">{user.email}</p>
                </div>

                {/* VEHICLES */}
                <div className="section">
                    <h3>My Vehicles</h3>

                    {vehicles.length === 0 && (
                        <p className="muted">No vehicles added</p>
                    )}

                    {vehicles.map(v => (
                        <div className="vehicle-row" key={v.vehicleId}>
                            {editingId === v.vehicleId ? (
                                <>
                                    <input
                                        value={editingValue}
                                        onChange={e =>
                                            setEditingValue(e.target.value)
                                        }
                                    />
                                    <button
                                        className="btn save"
                                        onClick={() => saveEdit(v.vehicleId)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="btn cancel"
                                        onClick={() => setEditingId(null)}
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="vehicle-no">
                                        {v.vehicleNumber}
                                    </span>
                                    <button
                                        className="btn edit"
                                        onClick={() => {
                                            setEditingId(v.vehicleId);
                                            setEditingValue(v.vehicleNumber);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn delete"
                                        onClick={() =>
                                            deleteVehicle(v.vehicleId)
                                        }
                                    >
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    ))}

                    <div className="add-vehicle">
                        <input
                            placeholder="MH12AB1234"
                            value={newVehicle}
                            onChange={e => setNewVehicle(e.target.value)}
                        />
                        <button className="btn add" onClick={addVehicle}>
                            Add
                        </button>
                    </div>
                </div>

                {/* BOOKINGS */}
                <div className="section">
                    <h3>Booking History</h3>

                    {bookings.length === 0 && (
                        <p className="muted">No bookings yet</p>
                    )}

                    {bookings.map((b, i) => (
                        <div className="booking-card" key={i}>
                            <p>
                                <b>Vehicle:</b> {b.vehicleNumber}
                            </p>
                            <p>
                                <b>From:</b>{" "}
                                {new Date(b.startTime).toLocaleString()}
                            </p>
                            <p>
                                <b>To:</b>{" "}
                                {new Date(b.endTime).toLocaleString()}
                            </p>
                            <p>
                                <b>Amount:</b> ₹{b.totalAmount}
                            </p>
                            <span className={`status ${b.status.toLowerCase()}`}>
                                {b.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
