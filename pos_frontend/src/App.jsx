import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// Ensure AuditLogs is now exported from ./pages/index.js
import { Home, Auth, Orders, Menu, Data, Dashboard, AuditLogs } from "./pages"; 
import Header from "./components/shared/Header";
import { useSelector } from 'react-redux';
import { Navigate } from "react-router-dom";
import './App.css';
import useLoadData from './hooks/useLoadData';
import FullScreenLoader from "./components/shared/FullScreenLoader";
import Register from './components/auth/Register';
import ManageUsers from './components/dashboard/ManageUsers';

function Layout() {
    const isLoading = useLoadData();
    const location = useLocation();
    const hideHeaderRoutes = ["/auth"];
    const { isAuth } = useSelector(state => state.user);

    if (isLoading) return <FullScreenLoader />

    return (
        <>
            {!hideHeaderRoutes.includes(location.pathname) && <Header />}
            <Routes>
                <Route path="/" element={<ProtectedRoutes><Home /></ProtectedRoutes>} />
                <Route path="/auth" element={isAuth ? <Navigate to="/" /> : <Auth />} />
                <Route path="/orders" element={<ProtectedRoutes><Orders /></ProtectedRoutes>} />
                <Route path="/menu" element={<ProtectedRoutes><Menu /></ProtectedRoutes>} />
                
                <Route path="/data" element={<AdminRoutes><Data /></AdminRoutes>} />
                <Route path="/dashboard" element={<AdminRoutes><Dashboard /></AdminRoutes>} />

                {/* Create User Route (Admin Only) */}
                <Route
                    path="/users/create"
                    element={
                        <AdminRoutes>
                            <Register />
                        </AdminRoutes>
                    }
                />
                
                {/* Manage Users Route (Admin Only) */}
                <Route
                    path="/users/manage"
                    element={
                        <AdminRoutes>
                            <ManageUsers />
                        </AdminRoutes>
                    }
                />

                {/* 👇 NEW AUDIT LOGS ROUTE */}
                <Route
                    path="/audit"
                    element={
                        <AdminRoutes>
                            <AuditLogs />
                        </AdminRoutes>
                    }
                />

                <Route path="/*" element={<div>Page Not Found</div>} />
            </Routes>
        </>
    );
}

function ProtectedRoutes({ children }) {
    const { isAuth } = useSelector(state => state.user);
    if (!isAuth) {
        return <Navigate to="/auth" />
    }
    return children;
}

function AdminRoutes({ children }) {
    const userData = useSelector(state => state.user);

    if (!userData.isAuth) {
        return <Navigate to="/auth" />;
    }

    if (userData.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
}

function App() {
    return (
        <Router>
            <Layout />
        </Router>
    );
}

export default App;