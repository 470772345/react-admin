import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Posters from "@/pages/Posters";
import NotFound from "@/pages/NotFound";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/", element: <Dashboard /> },
  { path: "/users", element: <Users /> },
  { path: "/posters", element: <Posters /> },
  { path: "*", element: <NotFound /> },
]);

export default router; 