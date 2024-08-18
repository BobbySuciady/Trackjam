"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AddFriend() {
  const { data: session, status } = useSession();
  const [friendEmail, setFriendEmail] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
  }, [status, router]);

  const addFriend = async () => {
    if (status === "authenticated" && session) {
      try {
        await axios.post('/api/friends', { friendEmail }, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`, // Make sure the token is passed correctly
          },
        });
    
        setFriendEmail('');
        setMessage('Friend added successfully!');

      } catch (error) {
        console.error('Error adding friend:', error);
        setMessage('Failed to add friend. Please try again.');
      }
    } else {
      setMessage('You are not authenticated. Please log in.');
    }
  };

  return (
    <div className="bg-gray-300 min-h-screen flex flex-col justify-between">
        {/* Header */}
      <div className="w-full bg-white rounded-b-lg border-black border-b-2 shadow-custom flex items-center flex-col sticky top-0 z-50" >
        <Image
          src={"/Header.png"}
          alt={"iPhone header"}
          width={450}
          height={50}
        />
        <div className="mt-4">
          <Image
            src={"/TrackJam.png"}
            alt={"TrackJam logo"}
            width={130}
            height={130}
            className="rounded-full"
          />
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center">
        <div className="bg-white max-w-sm w-full p-8 rounded-lg shadow-md">
          <h1 className="text-xl font-semibold mb-4">Add a Friend</h1>
          <input
            type="email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            placeholder="Friend's Email"
            className="mb-4 w-full p-2 border border-gray-300 rounded"
          />
          <button onClick={addFriend} className="bg-blue-500 text-white p-2 rounded w-full">
            Add Friend
          </button>
          {message && <p className="mt-4 text-center">{message}</p>}
        </div>
      </div>

      {/* NAVBAR */}
      <div className="fixed bottom-0 w-full grid grid-cols-4 gap-8 px-4 py-4" style={{ backgroundColor: '#6C2DEB' }}>
        <Link href="/">
          <Image
            src="/Home.png"
            alt="Home"
            width={50}
            height={50}
          />
        </Link>

        <Link href="/search">
          <Image
            src="/Search.png"
            alt="Search"
            width={50}
            height={50}
          />
        </Link>

        <Link href="/leaderboard">
          <Image
            src="/Barchart.png"
            alt="Leaderboard"
            width={50}
            height={50}
          />
        </Link>

        <Link href="/profile">
          <Image
            src="/Profile.png"
            alt="Profile"
            width={50}
            height={50}
          />
        </Link>
      </div>

      <div className="flex justify-center mt-4">
        <Image
          src="/FooterBar.png"
          alt="Footer Bar"
          width={250}
          height={250}
        />
      </div>
    </div>
  );
}
