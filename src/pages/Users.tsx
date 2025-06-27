import { useState, useMemo, useCallback, memo } from "react";

// 子组件用 React.memo 包裹，只有 props 变化才会重新渲染
const UserItem = memo(function UserItem({ user, onClick }: { user: string; onClick: (user: string) => void }) {
  console.log("UserItem render:", user);
  return (
    <li className="p-4 bg-gray-100 rounded cursor-pointer" onClick={() => onClick(user)}>
      {user}
    </li>
  );
});

export default function Users() {
  const [users, setUsers] = useState(["User 1", "User 2", "User 3"]);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [newUser, setNewUser] = useState("");
  const [error, setError] = useState("");

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
          <UserItem key={user} user={user} onClick={handleUserClick} />
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