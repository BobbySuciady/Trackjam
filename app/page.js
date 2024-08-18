"use client";

import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push('/dashboard');
    return null;
  }

  return (
    <main className="bg-gray-300 min-h-screen flex justify-center items-center">
      <div className="bg-white max-w-sm w-full min-h-screen rounded-lg shadow-md flex flex-col items-center">
        {!session ? (
          <>
            {/* iPhone-like Header */}
            <div className="relative w-full mb-6">
              <Image
                src="/Header.png"
                alt="iPhone header"
                width={450}
                height={50}
                className="w-full rounded-t-lg"
              />
              <div className="absolute inset-x-0 top-20 flex justify-center">
                <Image
                  src="/trackJamLogo.png"
                  alt="TrackJam Logo"
                  width={150}
                  height={150}
                  className="w-40 h-40" // Larger to avoid cropping
                />
              </div>
            </div>

            {/* Text Section */}
            <div className="text-center mt-40 px-4">
              <h1 className="text-2xl font-bold">Stream, team, and reign supreme with TrackJam!</h1>
              <p className="mt-4 text-lg">
                Compare your Spotify listening minutes, challenge friends, and climb the leaderboard. Share song recommendations to earn points and expand your musical horizons.
              </p>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col items-center gap-4 mt-auto mb-24 w-full px-4">
              <button 
                className="bg-green-600 text-white py-2 px-6 rounded-lg text-lg w-full"
                onClick={() => signIn('spotify')}
              >
                Sign in with Spotify
              </button>
              <button 
                className="bg-gray-400 text-white py-2 px-6 rounded-lg text-lg w-full"
                disabled
              >
                Log in
              </button>
            </div>

            {/* iPhone-like Footer */}
            <div className="w-full">
              <Image
                src="/FooterBar.png"
                alt="iPhone footer"
                width={450}
                height={50}
                className="w-full"
              />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold mt-6">Welcome, {session.user.name}!</h1>
            <p className="mt-2 text-lg">You're logged in with Spotify.</p>
            <p className="mt-2 text-lg">Let's continue your music journey with TrackJam.</p>

            <button 
              className="bg-red-500 text-white py-2 px-6 rounded-lg text-lg mt-6"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </>
        )}
      </div>
    </main>
  );
}
