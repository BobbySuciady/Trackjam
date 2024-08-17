// app/page.js or wherever you want to place the login button
"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; 

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!session ? (
        <>
          <h1>Welcome to Spotify Tracker</h1>
          <button onClick={() => signIn('spotify')}>Login with Spotify</button>
        </>
      ) : (
        router.push('/dashboard'))}
    </main>
  );
}
