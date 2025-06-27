import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Dashboard from "@/pages/Dashboard";
import Users from "../pages/Users";
import Posters from "@/pages/Posters";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import DynamicForm from "@/pages/forms/DynamicForm";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> }, // 默认首页
      { path: "users", element: <Users /> },
      { path: "posters", element: <Posters /> },
      { path: "dynamicForm", element: <DynamicForm /> },
      // ...更多子路由
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router; 