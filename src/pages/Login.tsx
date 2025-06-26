import { Button } from "@/components/ui/button";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
        <input className="w-full mb-4 px-3 py-2 border rounded" placeholder="Username" />
        <input className="w-full mb-6 px-3 py-2 border rounded" placeholder="Password" type="password" />
        <Button className="w-full">Login</Button>
      </div>
    </div>
  );
} 