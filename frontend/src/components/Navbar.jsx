import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "../context/UserContext";

function Navbar() {
  const navigate = useNavigate();

  const { user, setUser } = useContext(UserContext);

  const [notificationCount, setNotificationCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadNotificationCount = async () => {
    const token = localStorage.getItem("access");

    if (!token) return;

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/notifications/count/",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setNotificationCount(data.count || 0);
    } catch (error) {
      console.error("Notification count error:", error);
    }
  };

 useEffect(() => {
  if (!user) {
    setNotificationCount(0);
    return;
  }

  loadNotificationCount();

  const interval = setInterval(() => {
    loadNotificationCount();
  }, 10000);

  return () => clearInterval(interval);
}, [user]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);
    setMobileMenuOpen(false);

    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Main Navbar */}
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 no-underline"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl text-white shadow-md">
              🛠️
            </div>

            <div>
              <div className="text-lg font-bold leading-tight text-slate-900">
                Service Marketplace
              </div>

              <div className="hidden text-xs text-slate-500 sm:block">
                Trusted services. Trusted workers.
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 lg:flex">

            <Link
              to="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100 hover:text-blue-600"
            >
              Home
            </Link>

            {user && (
              <Link
                to="/services"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100 hover:text-blue-600"
              >
                Services
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100 hover:text-blue-600"
              >
                Profile
              </Link>
            )}

            {user && (
              <Link
                to="/notifications"
                className="relative rounded-lg px-4 py-2 text-sm font-medium text-slate-700 no-underline transition hover:bg-slate-100 hover:text-blue-600"
              >
                <span className="flex items-center gap-2">
                  🔔
                  <span>Notifications</span>

                  {notificationCount > 0 && (
                    <span className="min-w-[22px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-xs font-bold text-white">
                      {notificationCount}
                    </span>
                  )}
                </span>
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="ml-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-100 hover:text-blue-600"
              >
                Login
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="hidden items-center gap-3 lg:flex">

            {user && (
              <div className="relative">

                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white">
                    {user.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div className="text-left">
                    <div className="max-w-[120px] truncate text-sm font-semibold text-slate-900">
                      {user.username || "User"}
                    </div>

                    <div className="text-xs capitalize text-slate-500">
                      {user.role}
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    {profileOpen ? "▲" : "▼"}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
                    >
                      👤 Profile
                    </Link>

                    {user.role === "customer" && (
                      <Link
                        to="/customer-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
                      >
                        📊 Customer Dashboard
                      </Link>
                    )}

                    {user.role === "worker" && (
                      <Link
                        to="/worker-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
                      >
                        👷 Worker Dashboard
                      </Link>
                    )}

                    {user.role === "admin" && (
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
                      >
                        ⚙️ Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/notifications"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
                    >
                      🔔 Notifications
                    </Link>

                    <div className="my-1 border-t border-slate-200" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      🚪 Logout
                    </button>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-slate-200 p-2 text-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 py-4 lg:hidden">

            <div className="flex flex-col gap-1">

              <Link
                to="/"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
              >
                🏠 Home
              </Link>

              {user && (
                <Link
                  to="/services"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                >
                  🛠️ Services
                </Link>
              )}

              {user && (
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                >
                  👤 Profile
                </Link>
              )}

              {user && (
                <Link
                  to="/notifications"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                >
                  <span>🔔 Notifications</span>

                  {notificationCount > 0 && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                      {notificationCount}
                    </span>
                  )}
                </Link>
              )}

              {!user && (
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 text-sm font-semibold text-blue-600 no-underline hover:bg-blue-50"
                >
                  🔐 Login
                </Link>
              )}

              {user && (
                <>
                  {user.role === "customer" && (
                    <Link
                      to="/customer-dashboard"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                    >
                      📊 Customer Dashboard
                    </Link>
                  )}

                  {user.role === "worker" && (
                    <Link
                      to="/worker-dashboard"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                    >
                      👷 Worker Dashboard
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <Link
                      to="/admin-dashboard"
                      onClick={closeMobileMenu}
                      className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100"
                    >
                      ⚙️ Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 rounded-lg bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    🚪 Logout
                  </button>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </nav>
  );
}

export default Navbar;