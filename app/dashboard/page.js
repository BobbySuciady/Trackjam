"use client";

import { signIn, signOut, useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [songTitle, setSongTitle] = useState('');
  const [friendsListeningData, setFriendsListeningData] = useState([]); // Friends' listening data
  const [outOfViewUsers, setOutOfViewUsers] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null); // State to track selected person
  const router = useRouter();
  const observer = useRef();

  // Fetch user and friends data
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

        // Fetch what friends are currently listening to
        const friendsListeningResponse = await axios.get('/api/friends/currently-playing', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setFriendsListeningData(friendsListeningResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  }, [session, status]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Add a friend
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

  // Send song quest to a friend
  const sendSongQuest = (friend) => {
    setSelectedFriend(friend);
    setShowPopup(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (status === "authenticated" && session && selectedFriend) {
      try {
        console.log("Sending song quest to:", selectedFriend.name);

        await axios.post('/api/user/points', { action: 'add', friendId: selectedFriend.id }, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        // Fetch updated user and friends data
        fetchUserData();

        // Close the popup after sending the quest
        setShowPopup(false);
        setSongTitle('');
        setSelectedFriend(null);

      } catch (error) {
        console.error('Error sending song quest:', error);
      }
    }
  };

  // Calculate the staff position
  const getStaffPosition = (minutesListenedToday) => {
    return Math.floor(minutesListenedToday / 10);
  };

  const getRandomXPosition = () => {
    return Math.floor(Math.random() * 60) + 20; // Random X position between 20% and 80% of the container width
  };

  // Handle out of view observer
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

  const handleClickOutside = (event) => {
    if (event.target.closest('.selected-person') === null) {
      setSelectedPerson(null);
    }
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
              src={selectedPerson === 'user' ? "/Person1Selected.png" : "/Person1.png"}
              alt="User"
              className="absolute cursor-pointer selected-person"
              style={{ left: `${getRandomXPosition()}%`, top: 37 }}
              width={100}
              height={100}
              data-name={user.name}
              ref={el => {
                if (el) {
                  observer.current.observe(el);
                }
              }}
              onClick={() => setSelectedPerson('user')}
            />
          )}

          {/* Render each friend's image if their position matches the current staff position */}
          {friendsData.map((friend, friendIndex) => (
            getStaffPosition(friend.listeningMinutes) === staffPosition && (
              <Image
                key={friend.id}
                src={selectedPerson === `friend${friendIndex}` ? `/Person${friendIndex + 2}Selected.png` : `/Person${friendIndex + 2}.png`}
                alt={friend.name}
                className="absolute cursor-pointer selected-person"
                style={{ left: `${getRandomXPosition()}%`, top: 34 }}
                width={100}
                height={100}
                data-name={friend.name}
                ref={el => {
                  if (el) {
                    observer.current.observe(el);
                  }
                }}
                onClick={() => setSelectedPerson(`friend${friendIndex}`)}
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

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    router.push('/');
    return <p>You need to be logged in to view this page.</p>;
  }

  return (
    <div className="bg-gray-300 min-h-screen flex justify-center items-center relative">
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
        
        <h2 className="text-lg font-semibold mt-4">Your Friends' Listening Minutes</h2>
        <ul className="mt-2">
          {friendsData.length === 0 ? (
            <p>No friends data available.</p>
          ) : (
            friendsData.map((friend) => (
              <li key={friend.id} className="mt-1">
                {friend.name}: {friend.listeningMinutes?.toFixed(2) || 0} minutes

                {/* Display currently playing track if available */}
                {friendsListeningData.find((f) => f.id === friend.id)?.currentlyPlaying ? (
                  <div>
                    <p>Track: {friendsListeningData.find((f) => f.id === friend.id).currentlyPlaying.trackName}</p>
                    <p>Artist: {friendsListeningData.find((f) => f.id === friend.id).currentlyPlaying.artistName}</p>
                    <p>Album: {friendsListeningData.find((f) => f.id === friend.id).currentlyPlaying.albumName}</p>
                    <img src={friendsListeningData.find((f) => f.id === friend.id).currentlyPlaying.albumImage} alt="Album cover" width={100} />
                  </div>
                ) : (
                  <p>Not listening to anything currently</p>
                )}

                <button onClick={() => sendSongQuest(friend)}>Send Song Quest</button>
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

        <div className="flex flex-col justify-center items-center w-full bg-purple-700">
        {/* Display the selected person's details */}
        {selectedPerson && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 w-100 text-white bg-pink-600 p-4 rounded shadow-md z-50">
            {selectedPerson === 'user' ? (
              <div>
                <h3 className="font-bold">Realify's Points</h3>
                <p>{user?.listeningMinutes} points</p>
              </div>
            ) : (
              friendsData.map((friend, index) => (
                selectedPerson === `friend${index}` && (
                  <div key={friend.id}>
                    <h3 className="font-bold">{friend.name}'s Points</h3>
                    <p>{friend.listeningMinutes} points</p>
                  </div>
                )
              ))
            )}
          </div>
        )}
          <div className="w-full h-100 bg-pink-600">
            {/* WILLIAM CONTINUE HERE FOR DASHBOARD PAGE*/}

          </div>
          <div className="grid grid-cols-4 gap-8 px-4 py-4 w-full justify-center items-center">
            <Image
              src="/Home.png"
              alt="Home"
              width={50}
              height={50}
            />

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
                alt="Barchart"
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

          <Image
            src="/FooterBar.png"
            alt="Footer Bar"
            width={250}
            height={250}
          />
        </div>

      </div>

      {/* Out of view arrows */}
      {outOfViewUsers.map((user) => (
        <button
          key={user.name}
          className="bg-blue-500 text-white p-2 rounded fixed z-50 transform -translate-x-1/2"
          style={{
            left: `${user.xPosition}%`,
            top: user.isAbove ? '100px' : 'auto',
            bottom: user.isAbove ? 'auto' : '10px',
          }}
          onClick={() => scrollToUser(user.name)}
        >
          {user.name} {user.isAbove ? '↑' : '↓'}
        </button>
      ))}

      {/* Popup Form */}
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Send Song Quest to {selectedFriend?.name}</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Song Title:
                <input 
                  type="text" 
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                />
              </label>
              <button type="submit">Send</button>
              <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
