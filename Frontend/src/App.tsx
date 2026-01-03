import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Room from "./pages/Room";
import { WebSocketProvider } from "./libs/WebSockets"; 
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";


function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rooms" element={<Dashboard/>} />
          <Route path="/room/:roomName" element={<Room/>} />
          <Route path="/" element={<LandingPage/>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}

export default App;
