import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
//import Home from "./pages/Home";
//import Parking from "./pages/Parking";
//import Profile from "./pages/Profile";
//import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                {/*<Route path="/home" element={<Home />} />*/}
                {/*<Route path="/parking" element={<Parking />} />*/}
                {/*<Route path="/profile" element={<Profile />} />*/}
                {/*<Route path="/admin" element={<AdminDashboard />} />*/}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
