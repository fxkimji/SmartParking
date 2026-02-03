import React, { useState, useCallback } from "react";
import SearchBar from "../Components/SearchBar";
import MapView from "../Components/MapView";
import ParkingCard from "../Components/ParkingCard";
import BookingModal from "../Components/BookingModel";

export default function UserView() {

    const [parkingList, setParkingList] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [selectedParking, setSelectedParking] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const onParkingLoaded = useCallback((data) => {
        setParkingList(data);
    }, []);

    function handleNearbyParking(lat, lng) {
        window.shouldCenterMap = true;  
        setUserLocation([lat, lng]);
        fetch(`https://localhost:7237/api/parking/nearby?lat=${lat}&lng=${lng}`)
            .then(res => res.json())        // 👈 RETURN JSON
            .then(data => {
                console.log("Nearby parking:", data);
                setParkingList(data);
            })
            .catch(err => console.error("Fetch error:", err));

        //fetch(`https://localhost:7237/api/parking/nearby?lat=${lat}&lng=${lng}`)
        //    .then(res => {
        //        res.json();
        //        console.log(res);
        //    })
        //    .then(data => setParkingList(data));
    }


    function handleBookNow(parking) {
        setSelectedParking(parking);
        setShowModal(true);
    }

    return (
        <div>

            <SearchBar onSearchNearby={handleNearbyParking} />

            <div style={{ display: "flex", gap: "20px" }}>

                <div style={{ width: "60%" }}>
                    <MapView
                        userLocation={userLocation}
                        onParkingLoaded={onParkingLoaded}
                    />
                </div>

                <div style={{ width: "40%", height: "85vh", overflowY: "scroll" }}>
                    {parkingList.length === 0 ? (
                        <p>No parking available.</p>
                    ) : (
                            parkingList.map(item => (
                                <ParkingCard
                                    key={item.lotId}   
                                    data={item}
                                    onBook={handleBookNow}
                                />
                            ))
                    )}
                </div>

            </div>

            <BookingModal
                show={showModal}
                parking={selectedParking}
                onClose={() => setShowModal(false)}
            />

        </div>
    );
}
