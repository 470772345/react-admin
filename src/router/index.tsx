import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Posters from "@/pages/Posters";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AdminLayout><Dashboard /></AdminLayout>,
    children: [
      { path: "users", element: <Users /> },
      { path: "posters", element: <Posters /> },
      // ...更多子路由
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router; 