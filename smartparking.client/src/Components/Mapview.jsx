import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import GreenPin from "../assets/green-map-pin.svg";
import RedPin from "../assets/red-map-pin.svg";

export default function MapView({ userLocation, onParkingLoaded }) {

    const [bounds, setBounds] = useState(null);
    const parkingRef = useRef([]);
    const lastFetchBounds = useRef(null);

    // ============================================
    // 1️⃣ MAP SHOULD CENTER ONLY AFTER "Nearby Parking"
    // ============================================
    function MapController({ userLocation }) {
        const map = useMap();

        useEffect(() => {
            if (userLocation && window.shouldCenterMap) {
                map.setView(userLocation, 15);
                window.shouldCenterMap = false; // prevent recentering
            }
        }, [userLocation]);

        return null;
    }

    // ============================================
    // 2️⃣ CAPTURE MAP MOVEMENT SAFELY
    // ============================================
    function MapEvents() {
        const last = useRef(null);

        useMapEvents({
            moveend: (e) => {
                const b = e.target.getBounds();

                const curr = {
                    north: b.getNorth(),
                    south: b.getSouth(),
                    east: b.getEast(),
                    west: b.getWest()
                };

                // prevent infinite updates — ONLY update if real change
                if (
                    last.current &&
                    last.current.north === curr.north &&
                    last.current.south === curr.south &&
                    last.current.east === curr.east &&
                    last.current.west === curr.west
                ) {
                    return;
                }

                last.current = curr;
                setBounds(b); // safe update
            }
        });

        return null;
    }

    // ============================================
    // 3️⃣ FETCH PARKING ONLY WHEN BOUNDS CHANGE
    // ============================================
    useEffect(() => {
        if (!bounds) return;

        const b = {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
        };

        // STOP if same bounds (prevents infinite fetch loop)
        if (JSON.stringify(b) === JSON.stringify(lastFetchBounds.current)) {
            return;
        }
        lastFetchBounds.current = b;

        fetch("https://localhost:7237/api/parking/by-bounds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                NorthLat: b.north,
                SouthLat: b.south,
                EastLng: b.east,
                WestLng: b.west
            })
        })
            .then(res => res.json())
            .then(data => {
                parkingRef.current = data;
                onParkingLoaded(data);
            });

    }, [bounds]);

    // ============================================
    // 4️⃣ RENDER MAP + MARKERS
    // ============================================
    return (
        <MapContainer
            center={userLocation || [19.1136, 72.8697]}
            zoom={13}
            style={{ height: "450px", width: "100%" }}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapController userLocation={userLocation} />
            <MapEvents />

            {parkingRef.current.map(p => (
                <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={L.icon({
                        iconUrl: p.available > 0 ? GreenPin : RedPin,
                        iconSize: [40, 40],
                        iconAnchor: [20, 40]
                    })}
                >
                    <Popup>
                        <b>{p.name}</b><br />
                        Available: {p.available}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}


