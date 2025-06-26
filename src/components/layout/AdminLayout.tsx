import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-screen">
      {/* 侧边栏 */}
      <Sidebar />
      {/* 主体部分 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部栏 */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <div className="font-bold text-lg">Admin Panel</div>
          <div>
            {/* 这里可以放用户信息、设置等 */}
            <span className="mr-4">Jane Doe</span>
          </div>
        </header>
        {/* 主内容区 */}
        <main className="flex-1 bg-gray-50 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 