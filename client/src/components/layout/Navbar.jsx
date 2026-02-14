import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Database, Settings, GraduationCap, Moon, Sun, Users, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from "../ui/ThemeProvider";
import { Button } from "../ui/Button";

const Navbar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { path: '/', label: 'Routine View', icon: <Calendar size={18} /> },
        { path: '/week-routine', label: 'Week View', icon: <Calendar size={18} /> },
        { path: '/faculty', label: 'Faculty', icon: <Users size={18} /> },
        { path: '/admin', label: 'Admin Panel', icon: <Database size={18} /> },
    ];

    return (
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                            <GraduationCap size={24} className="text-white" />
                        </div>
                        <div className="hidden md:block">
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                                Smart Routine
                            </h1>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">Management System</p>
                        </div>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center space-x-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">
                        <div className="hidden md:flex items-center space-x-1 text-xs text-gray-400 mr-2 bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded">
                            <Settings size={12} />
                            <span>v1.0.0 Alpha</span>
                        </div>
                        <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 mx-2 hidden md:block"></div>
                        <ThemeToggle />

                        {/* Mobile Menu Button */}
                        <div className="md:hidden ml-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(!isOpen)}
                                className="h-9 w-9 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                            >
                                {isOpen ? <X size={20} /> : <Menu size={20} />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 animate-in slide-in-from-top-2 duration-300">
                    <div className="py-2 px-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                    )}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                        {/* Mobile Settings Link (Optional) */}
                        <div className="flex items-center px-3 py-3 text-xs text-gray-400 bg-gray-100 dark:bg-slate-900 rounded mt-2">
                            <Settings size={14} className="mr-2" />
                            <span>v1.0.0 Alpha</span>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

function ThemeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

export default Navbar;
