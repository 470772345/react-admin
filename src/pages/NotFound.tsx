import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 w-screen">
      <div className="flex flex-col items-center bg-white p-10 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h1 className="text-5xl font-bold mb-2 text-gray-800">404</h1>
        <p className="text-xl mb-6 text-gray-600">抱歉，您访问的页面不存在。</p>
        <Button onClick={() => navigate("/")}>返回首页</Button>
      </div>
    </div>
  );
} 