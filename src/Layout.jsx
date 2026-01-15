import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  ChefHat, 
  Home, 
  Search, 
  Calculator,
  LogOut,
  User,
  Menu,
  X,
  Utensils,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        try {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      }
    };
    checkAuth();
  }, [location.pathname]);

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: ChefHat },
    { name: "Meals", path: createPageUrl("Meals"), icon: Utensils },
    { name: "Search", path: createPageUrl("Search"), icon: Search },
    { name: "Unit Converter", path: createPageUrl("UnitConverter"), icon: Calculator },
    { name: "Tests", path: createPageUrl("Tests"), icon: TestTube },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <style>{`
        :root {
          --family-cream: #FFF8F0;
          --family-sage: #9CA986;
          --family-terracotta: #D4826C;
          --family-brown: #8B6F47;
          --family-gold: #D4A574;
        }
      `}</style>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-amber-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center space-x-3 group">
              <div className="relative">
                <ChefHat className="w-8 h-8 text-amber-700 group-hover:text-amber-800 transition-colors" />
                <div className="absolute -inset-1 bg-amber-200 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity" />
              </div>
              <span className="text-2xl font-serif font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">
                Family Table
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-amber-100 text-amber-900 shadow-sm"
                        : "text-gray-700 hover:bg-amber-50 hover:text-amber-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 hover:bg-amber-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                        {user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <span className="hidden md:block font-medium text-gray-700">
                        {user.full_name || user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(createPageUrl("Dashboard"))}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-amber-200 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-amber-100 text-amber-900"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-amber-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 font-serif">
            Preserving family heritage, one recipe at a time
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 Family Table • Created with love by Ariel, Eliyahu & Yair
          </p>
        </div>
      </footer>
    </div>
  );
}