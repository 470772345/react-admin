import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
// 如无 cn 工具可用 clsx 代替

const menu = [
  {
    label: "Dashboard",
    path: "/",
    icon: "🏠",
  },
  {
    label: "Users",
    icon: "👤",
    children: [
      { label: "User List", path: "/users" },
      { label: "User Roles", path: "/users/roles" },
    ],
  },
  {
    label: "Posters",
    icon: "🖼️",
    children: [
      { label: "Poster List", path: "/posters" },
      { label: "Categories", path: "/posters/categories" },
    ],
  },
];

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const location = useLocation();

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isMenuOpen = (label: string) => openMenus.includes(label);

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800">
        LOGO
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menu.map((item) =>
          item.children ? (
            <div key={item.label}>
              <button
                className={`flex items-center w-full px-4 py-2 rounded hover:bg-gray-800 transition justify-between ${
                  isMenuOpen(item.label) ? "bg-gray-800" : ""
                }`}
                onClick={() => toggleMenu(item.label)}
              >
                <span className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </span>
                <span>{isMenuOpen(item.label) ? "▼" : "▶"}</span>
              </button>
              {isMenuOpen(item.label) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <NavLink
                      key={child.path}
                      to={child.path}
                      className={({ isActive }) =>
                        `block px-4 py-2 rounded hover:bg-gray-700 transition ${
                          isActive || location.pathname === child.path
                            ? "bg-gray-700 font-bold"
                            : ""
                        }`
                      }
                    >
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              key={item.path}
              to={item.path!}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded hover:bg-gray-800 transition ${
                  isActive ? "bg-gray-800 font-bold" : ""
                }`
              }
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
} 