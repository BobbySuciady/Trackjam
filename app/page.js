// app/page.js or wherever you want to place the login button
"use client";

import { signIn, signOut, useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!session ? (
        <>
          <h1>Welcome to Spotify Tracker</h1>
          <button onClick={() => signIn('spotify')}>Login with Spotify</button>
        </>
      ) : (
        <>
          <h1>Welcome, {session.user.name}</h1>
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </main>
  );
}
