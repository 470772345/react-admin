import { useState, useMemo, useCallback, memo } from "react";
import React from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

// 页面级 ErrorBoundary 组件（class 实现，保留）
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("Error caught:", error, errorInfo);
  }
  handleRetry = () => {
    this.setState({ hasError: false });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-100 text-red-700 rounded">
          页面发生错误，请稍后重试。
          <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={this.handleRetry}>
            重试
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// 子组件用 React.memo 包裹，只有 props 变化才会重新渲染
const UserItem = memo(function UserItem({ user, onClick, broken }: { user: string; onClick: (user: string) => void; broken?: boolean }) {
  // 只有 broken 为 true 时才抛出错误
  if (broken) {
    throw new Error("模拟渲染出错！");
  }
  console.log("UserItem render:", user);
  return (
    <li className="p-4 bg-gray-100 rounded cursor-pointer" onClick={() => onClick(user)}>
      {user}
    </li>
  );
});

// react-error-boundary 的 fallback 组件
function UserItemFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-2 bg-red-100 text-red-700 rounded">
      该用户渲染出错：{error.message}
      <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={resetErrorBoundary}>
        重试（恢复该用户）
      </button>
    </div>
  );
}

function UsersInner() {
  const [users, setUsers] = useState(["User 1", "User 2", "User 3"]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [newUser, setNewUser] = useState("");
  const [error, setError] = useState("");
  // 控制哪些用户需要模拟报错
  const [brokenUsers, setBrokenUsers] = useState(["User 2"]);

  // useMemo 用于缓存过滤后的用户列表，只有 users 或 filter 变化时才重新计算
  const filteredUsers = useMemo(() => {
    return users.filter((u) => u.toLowerCase().includes(filter.toLowerCase()));
  }, [users, filter]);

  // useCallback 用于缓存点击事件处理函数，只有 setSelected 变化时才重新生成
  const handleUserClick = useCallback((user: string) => {
    setSelected(user);
  }, []);

  // 添加新用户，防止重复
  const handleAddUser = useCallback(() => {
    const trimmed = newUser.trim();
    if (!trimmed) return;
    if (users.includes(trimmed)) {
      setError(`用户 "${trimmed}" 已存在！`);
      return;
    }
    setUsers((prev) => [...prev, trimmed]);
    setNewUser("");
    setError("");
  }, [newUser, users]);

  // 测试 ErrorBoundary：当用户数量大于5时抛出错误
  // if (users.length > 5) {
  //   throw new Error("用户数量太多，模拟渲染错误！");
  // }

  return (
    <div className="p-8 rounded-lg bg-red-200">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <div className="flex mb-4 gap-2">
        <input
          className="px-3 py-2 border rounded w-full bg-white"
          placeholder="Filter users..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="flex mb-4 gap-2">
        <input
          className="px-3 py-2 border rounded w-full bg-white"
          placeholder="Add new user..."
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleAddUser}
        >
          Add
        </button>
      </div>
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <ul className="space-y-2">
        {filteredUsers.map((user) => (
          <ReactErrorBoundary
            key={user}
            FallbackComponent={UserItemFallback}
            onReset={() => setBrokenUsers((prev) => prev.filter((u) => u !== user))}
            resetKeys={[brokenUsers]}
          >
            <UserItem user={user} onClick={handleUserClick} broken={brokenUsers.includes(user)} />
          </ReactErrorBoundary>
        ))}
      </ul>
      {selected && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <strong>Selected User:</strong> {selected}
        </div>
      )}
    </div>
  );
}

export default function Users() {
  return (
    <ErrorBoundary>
      <UsersInner />
    </ErrorBoundary>
  );
} 