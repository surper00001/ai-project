"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TestAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      console.log("No session found, redirecting to signin");
      router.push("/auth/signin");
    } else {
      console.log("Session found:", session);
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Loading session...</div>;
  }

  if (!session) {
    return <div>No session found</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      <div className="bg-green-100 p-4 rounded">
        <h2 className="text-lg font-semibold text-green-800">✅ Authentication Successful!</h2>
        <div className="mt-2 text-sm text-green-700">
          <p><strong>User ID:</strong> {session.user?.id}</p>
          <p><strong>Email:</strong> {session.user?.email}</p>
          <p><strong>Name:</strong> {session.user?.name}</p>
        </div>
      </div>
      <div className="mt-4">
        <button 
          onClick={() => router.push("/")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
}
