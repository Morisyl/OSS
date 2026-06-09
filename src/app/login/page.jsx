"use client";

import { useState } from 'react';
import { signIn } from '../../lib/auth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // signIn automatically appends @oss.local internally
      await signIn(username, password);
      // Note: Layout's AuthGuard will automatically push to /home upon session creation
    } catch (err) {
      setError("Invalid username or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-black">
      {/* Replaced rounded-[2rem] with rounded-4xl to clear the Tailwind linter warning */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-10 rounded-4xl shadow-2xl border border-gray-100 dark:border-gray-800">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-black dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Sign in to the OSS Hub</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input 
            label="Username" 
            placeholder="Enter your username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}