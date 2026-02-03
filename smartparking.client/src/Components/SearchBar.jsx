import React from "react";
import "../../css/SearchBar.css";
import { FaSearch } from "react-icons/fa";

export default function SearchBar({ onSearchNearby }) {

    const handleNearbyClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    onSearchNearby(lat, lng);  // 🚀 call parent
                },
                (err) => {
                    console.log("Location Permission Denied", err);
                }
            );
        }
    };

    return (
        <div className="search-container">
            <div className="search-row-1">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search Parking in Mumbai, Pune, Delhi..." />
                </div>

                <button className="search-btn" onClick={handleNearbyClick}>
                    Find Nearby Parking
                 </button>
            </div>

            <div className="search-row-2">
                <select className="dropdown">
                    <option>🛵 2 Wheeler</option>
                    <option>🚗 4 Wheeler</option>
                </select>

                <select className="dropdown">
                    <option>₹41 - ₹55</option>
                    <option>₹56 - ₹80</option>
                </select>
            </div>

        </div>
    );
}
