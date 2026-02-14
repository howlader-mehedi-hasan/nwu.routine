import React from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

const DashboardLayout = ({ children, fullWidth = false }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Navbar />
            <main className={fullWidth ? "w-full p-4 sm:p-6 lg:p-8" : "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"}>
                {children}
            </main>
            <Toaster position="top-right" />
        </div>
    );
};

export default DashboardLayout;
