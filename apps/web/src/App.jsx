import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Auctions from "./pages/Auctions";
import AuctionDetails from "./pages/AuctionDetails";
import AuctionRoom from "./pages/AuctionRoom";
import CreateAuction from "./pages/CreateAuction";
import NotFound from "./pages/NotFound";

function PublicOnly({ children }) {
  const token = useSelector((state) => state.auth.token);
  if (token) {
    return <Navigate to="/auctions" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes (Redirects to /auctions if already logged in) */}
      <Route
        path="/login"
        element={
          <PublicOnly>
            <Login />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <Register />
          </PublicOnly>
        }
      />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/auctions" replace />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetails />} />
        <Route path="/auctions/:id/room" element={<AuctionRoom />} />
        <Route path="/create" element={<CreateAuction />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
