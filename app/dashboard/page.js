"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [outOfViewUsers, setOutOfViewUsers] = useState([]);
  const router = useRouter();
  const observer = useRef();

  const fetchUserData = useCallback(async () => {
    if (session && status === "authenticated") {
      try {
        const response = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setUser(response.data);

        const friendsResponse = await axios.get('/api/friends', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setFriendsData(friendsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [session, status]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const addFriend = async () => {
    try {
      await axios.post('/api/friends', { friendEmail }, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`,
        },
      });
  
      setFriendEmail('');
      
      const { data } = await axios.get('/api/friends', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
  
      setFriendsData(data);
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const getStaffPosition = (minutesListenedToday) => {
    return Math.floor(minutesListenedToday / 10);
  };

  const getRandomXPosition = () => {
    return Math.floor(Math.random() * 60) + 20; // Random X position between 20% and 80% of the container width
  };

  const handleObserver = (entries) => {
    const newOutOfViewUsers = [...outOfViewUsers]; // Copy the current state
    entries.forEach(entry => {
      const name = entry.target.dataset.name;
      const isInView = entry.isIntersecting;

      // Check if the person is in view or not
      if (!isInView) {
        const boundingRect = entry.boundingClientRect;
        const isAboveViewport = boundingRect.top < 0;
        const isBelowViewport = boundingRect.bottom > window.innerHeight;

        if (!newOutOfViewUsers.some(user => user.name === name)) {
          newOutOfViewUsers.push({
            name,
            isAbove: isAboveViewport,
            xPosition: getRandomXPosition(),
          });
        }
      } else {
        // If the person comes back into view, remove them from the outOfViewUsers list
        const index = newOutOfViewUsers.findIndex(user => user.name === name);
        if (index !== -1) {
          newOutOfViewUsers.splice(index, 1);
        }
      }
    });

    setOutOfViewUsers(newOutOfViewUsers); // Update the state with the new list
  };

  const renderNumberList = () => {
    const numbers = [];
    for (let i = 40; i >= 0; i--) {
      numbers.push(i.toString().padStart(2, '0')); // Pads single digits with a leading 0
    }
    return numbers.map((number, index) => {
      const staffPosition = parseInt(number);

      return (
        <div key={index} className="flex items-center h-24 border-b-1 border-black relative">
          <div className="absolute inset-0 flex justify-left items-center pl-2">
            <span className="font-bold text-3xl">{number}</span>
          </div>
          {/* Additional lines within the box */}
          <div className="absolute inset-0 top-1/6 border-t border-black"></div>
          <div className="absolute inset-0 top-1/3 border-t border-black"></div>
          <div className="absolute inset-0 top-1/2 border-t border-black"></div>
          <div className="absolute inset-0 top-2/3 border-t border-black"></div>
          <div className="absolute inset-0 top-5/6 border-t border-black"></div>
        
          {/* Render the user's image if their position matches the current staff position */}
          {user && getStaffPosition(user.listeningMinutes) === staffPosition && (
            <Image
              src="/Person1.png"
              alt="User"
              className="absolute"
              style={{ left: `${getRandomXPosition()}%`, top: 37 }}
              width={100}
              height={100}
              data-name={user.name}
              ref={el => {
                if (el) {
                  observer.current.observe(el);
                }
              }}
            />
          )}

          {/* Render each friend's image if their position matches the current staff position */}
          {friendsData.map((friend, friendIndex) => (
            getStaffPosition(friend.listeningMinutes) === staffPosition && (
              <Image
                key={friend.id}
                src={`/Person${friendIndex + 2}.png`} // Assuming you have Person2.png, Person3.png, etc.
                alt={friend.name}
                className="absolute"
                style={{ left: `${getRandomXPosition()}%`, top: 34 }}
                width={100}
                height={100}
                data-name={friend.name}
                ref={el => {
                  if (el) {
                    observer.current.observe(el);
                  }
                }}
              />
            )
          ))}
        </div>
      );
    });
  };

  const scrollToUser = (userName) => {
    const userElement = document.querySelector(`[data-name="${userName}"]`);
    if (userElement) {
      userElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1, // Adjust the threshold as needed
    });
    return () => observer.current.disconnect();
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push('/');
    return <p>You need to be logged in to view this page.</p>;
  }

  return (
    <div className="bg-gray-300 min-h-screen p-4 flex justify-center items-center relative">
      <div className="bg-white max-w-sm w-full min-h-screen rounded-lg shadow-md flex flex-col items-center">
        
        {/* Sticky Header Package */}
        <div className="w-full bg-white rounded-b-lg border-black border-b-2 shadow-custom flex items-center flex-col sticky top-0 z-10">
          {/* iPhone-like Header */}
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

        <h1 className="text-xl font-semibold">Welcome, {session.user.name}</h1>
        <h2 className="text-lg font-semibold mt-4">Your Listening Minutes</h2>
        <p className="mt-2 text-lg">You have listened to {user?.listeningMinutes || 0} minutes of music today.</p>
        
        <h2 className="text-lg font-semibold mt-4">Your Friends Listening Minutes</h2>
        <ul className="mt-2">
          {friendsData.length === 0 ? (
            <p>No friends data available.</p>
          ) : (
            friendsData.map((friend) => (
              <li key={friend.id} className="mt-1">
                {friend.name}: {friend.listeningMinutes?.toFixed(2) || 0} minutes
              </li>
            ))
          )}
        </ul>

        <h3 className="text-lg font-semibold mt-4">Add a Friend</h3>
        <input
          type="email"
          value={friendEmail}
          onChange={(e) => setFriendEmail(e.target.value)}
          placeholder="Friend's Email"
          className="mt-2 w-full p-2 border border-gray-300 rounded"
        />
        <button onClick={addFriend} className="mt-2 bg-blue-500 text-white p-2 rounded w-full">
          Add Friend
        </button>

        {/* Sign Out Button */}
        <div className="mt-4">
          <button onClick={() => signOut()} className="bg-red-500 text-white p-2 rounded w-full">
            Sign Out
          </button>
        </div>

        {/* Scrollable Number List */}
        <div className="number-list-container overflow-y-scroll h-full w-full border-2 border-black mt-4">
          {renderNumberList()}
        </div>

      </div>

      {/* Out of view arrows */}
      {outOfViewUsers.map((user) => (
        <button
          key={user.name}
          className="bg-blue-500 text-white p-2 rounded fixed z-50 transform -translate-x-1/2"
          style={{
            left: `${user.xPosition}%`,
            top: user.isAbove ? '10px' : 'auto',
            bottom: user.isAbove ? 'auto' : '10px',
          }}
          onClick={() => scrollToUser(user.name)}
        >
          {user.name} {user.isAbove ? '↑' : '↓'}
        </button>
      ))}

    </div>
  );
}
