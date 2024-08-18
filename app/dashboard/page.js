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
  const [outOfViewUsers, setOutOfViewUsers] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null); 
  const [loading, setLoading] = useState(false);
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
        const {
            lastPlayedTrackName,
            lastPlayedTrackAlbumImage,
            lastPlayedTrackArtist,
            ...restUserData
          } = response.data;
    
          setUser({
            ...restUserData,
            lastPlayedTrackName,
            lastPlayedTrackAlbumImage,
            lastPlayedTrackArtist,
          });

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
    setLoading(true);
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
        setLoading(false);
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
    return Math.floor(Math.random() * 60) + 20;
  };

  // Handle out of view observer
  const handleObserver = (entries) => {
    const newOutOfViewUsers = [...outOfViewUsers];
    entries.forEach(entry => {
      const name = entry.target.dataset.name;
      const isInView = entry.isIntersecting;

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
        const index = newOutOfViewUsers.findIndex(user => user.name === name);
        if (index !== -1) {
          newOutOfViewUsers.splice(index, 1);
        }
      }
    });

    setOutOfViewUsers(newOutOfViewUsers);
  };

  const handleClickOutside = (event) => {
    if (event.target.closest('.selected-person') === null) {
      setSelectedPerson(null);
    }
  };

  const renderNumberList = () => {
    const numbers = [];
    for (let i = 40; i >= 0; i--) {
      numbers.push(i.toString().padStart(2, '0'));
    }
    return numbers.map((number, index) => {
      const staffPosition = parseInt(number);

      return (
        <div key={index} className="flex items-center h-24 border-b-1 border-black relative">
          <div className="absolute inset-0 flex justify-left items-center pl-2">
            <span className="font-bold text-3xl">{number}</span>
          </div>
          <div className="absolute inset-0 top-1/6 border-t border-black"></div>
          <div className="absolute inset-0 top-1/3 border-t border-black"></div>
          <div className="absolute inset-0 top-1/2 border-t border-black"></div>
          <div className="absolute inset-0 top-2/3 border-t border-black"></div>
          <div className="absolute inset-0 top-5/6 border-t border-black"></div>
        
          {user && getStaffPosition(user.listeningMinutes+user.points) === staffPosition && (
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

          {friendsData.map((friend, friendIndex) => (
            getStaffPosition(friend.listeningMinutes+friend.points) === staffPosition && (
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
      threshold: 0.1,
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
    <div className="bg-gray-300 min-h-screen flex justify-center items-center relative font-londrina">
        
      <div className="bg-white max-w-sm w-full min-h-screen rounded-lg shadow-md flex flex-col items-center">
        
        <div className="w-full bg-white rounded-b-lg border-black border-b-2 shadow-custom flex items-center flex-col sticky top-0 z-50">
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
        <p className="mt-2 text-lg">You have listened to {user?.listeningMinutes.toFixed(2) || 0} minutes of music today.</p>
        <p className="mt-2 text-lg">Your points {user?.points.toFixed(0) || 0}</p>
        <p>{user?.lastPlayedTrackName}</p>

        <h2 className="text-lg font-semibold mt-4">Your Friends' Last Played Tracks</h2>
        <ul className="mt-2">
          {friendsData.length === 0 ? (
            <p>No friends data available.</p>
          ) : (
            friendsData.map((friend) => (
              <li key={friend.id} className="mt-1">
                {friend.name}: {friend.listeningMinutes?.toFixed(2) || 0} minutes & {friend.points?.toFixed(0) || 0} points

                {friend.lastPlayedTrack ? (
                  <div>
                    <p>Last Played Track: {friend.lastPlayedTrack.trackName}</p>
                    <p>Artist: {friend.lastPlayedTrack.artistName}</p>
                    <p>Album: {friend.lastPlayedTrack.albumName}</p>
                    <img src={friend.lastPlayedTrack.albumImage} alt={`${friend.lastPlayedTrack.trackName} album cover`} width={100} />
                  </div>
                ) : (
                  <p>No recently played track available.</p>
                )}

                <h3 className="text-lg font-semibold mt-4">Top 4 Tracks</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {friend.topTracks?.map((track, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <img src={track.albumImage} alt={`Album cover for ${track.trackName}`} width={80} height={80} />
                      <p className="text-sm text-center mt-2">{track.trackName}</p>
                    </div>
                  ))}
                </div>

                <button onClick={() => sendSongQuest(friend)} className="mt-2 text-white p-2 rounded" style={{ backgroundColor: '#519804' }}>
                  Send Song Quest
                </button>
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

        <div className="flex flex-col justify-center items-center w-full" style={{ backgroundColor: '#6C2DEB' }}>
        {/* Display the selected person's details */}
        {selectedPerson && (
          <div className="fixed bottom-20 w-full left-1/2 transform -translate-x-1/2 text-white rounded shadow-md z-50 h-1/2" style={{ backgroundColor: 'DED0FF' }}>
          {selectedPerson === 'user' ? (
            <div className="h-full flex flex-col">
              {/* Top 1/3 section with purple background and name */}
              <div className="flex flex-col justify-center h-1/3 rounded-t p-9" style={{ backgroundColor: '#6C2DEB' }}>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                    <Image
                        src={`/blankpfp.png`}  // Replace with the correct path to the user's profile picture
                        alt={`${session.user.name} Profile`}
                        width={50}
                        height={50}
                        className="rounded-full mr-2"
                    />
                    <div className="flex flex-col">
                        <h3 className="font-bold text-xl">{session.user.name}</h3>
                        <p className='text-xs'>{user?.listeningMinutes.toFixed(2)} minutes listened</p>
                    </div>
                    </div>
                    <h3 className="font-bold text-xl">{(user?.listeningMinutes + user?.points).toFixed(2)} pts</h3>
                </div>
            </div>

      
              {/* Bottom 2/3 section with last played track in a static small box and top 4 favorite tracks */}
              <div className="flex-grow flex flex-col justify-around p-4" style={{ backgroundColor: '#DED0FF' }}>
                <h3 className="text-md font-bold mb-1 text-purple-500">Last Played Track</h3>
                <div className="flex flex-col items-center mb-4 bg-white p-4 rounded shadow-md w-full h-25">
                  {user?.lastPlayedTrackName && user?.lastPlayedTrackAlbumImage && user?.lastPlayedTrackArtist ? (
                    <div className="flex items-center text-sm">
                      <img
                        src={user.lastPlayedTrackAlbumImage}
                        alt={`${user.lastPlayedTrackName} album cover`}
                        width={50}
                        height={50}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <p className="font-semibold text-sm text-purple-500">{user.lastPlayedTrackName}</p>
                        <p className="text-xs text-purple-500">{user.lastPlayedTrackArtist}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm">No recently played track available.</p>
                  )}
                </div>
      
                {/* Top 4 Favorite Tracks */}
                <div className="flex flex-col items-center">
                  <h3 className="text-md font-bold mb-2 text-purple-500">Top 4 Tracks</h3>
                  <div className="flex justify-center space-x-4">
                    {user?.topTracks?.map((track, index) => (
                      <div key={index} className="flex flex-col items-center text-purple-500">
                        <img src={track.albumImage} alt={`Album cover for ${track.trackName}`} width={60} height={60} className="rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
) : (
  friendsData.map((friend, index) => (
    selectedPerson === `friend${index}` && (
      <div key={friend.id} className="h-full flex flex-col">
        {/* Top 1/3 section with purple background and name */}
        <div className="flex flex-col justify-center h-1/3 rounded-t p-9" style={{ backgroundColor: '#6C2DEB' }}>
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                <Image
                    src={`/blankpfp.png`}  // Replace with the correct path to the friend's profile picture
                    alt={`${friend.name} Profile`}
                    width={50}
                    height={50}
                    className="rounded-full mr-2"
                />
                <div className="flex flex-col">
                    <h3 className="font-bold text-xl">{friend.name}</h3>
                    <p className='text-xs'>{friend.listeningMinutes.toFixed(2)} minutes listened</p>
                </div>
                </div>
                <h3 className="font-bold text-xl">{(friend.listeningMinutes + friend.points).toFixed(2)} pts</h3>
            </div>
            <div className="flex justify-center mt-2">
                <button 
                onClick={() => sendSongQuest(friend)} 
                className="bg-blue-500 text-white p-2 rounded w-1/2 text-center" 
                style={{ backgroundColor: '#519804' }}
                >
                Send Song Quest
                </button>
            </div>
        </div>



        {/* Bottom 2/3 section with last played track in a static small box and top 4 favorite tracks */}
        <div className="flex-grow flex flex-col justify-around p-4" style={{ backgroundColor: '#DED0FF' }}>
          {/* Last Played Track in a Static Small Box */}
          <h3 className="text-md font-bold mb-1 text-purple-500">Last Played Track</h3>
          <div className="flex flex-col items-center mb-4 bg-white p-4 rounded shadow-md w-full h-25">
            
            {friend.lastPlayedTrack ? (
              <div className="flex items-center text-sm">
                <img
                  src={friend.lastPlayedTrack.albumImage}
                  alt={`${friend.lastPlayedTrack.trackName} album cover`}
                  width={50}
                  height={50}
                  className="rounded-full mr-4"
                />
                <div>
                  <p className="font-semibold text-sm text-purple-500">{friend.lastPlayedTrack.trackName}</p>
                  <p className="text-xs text-purple-500">{friend.lastPlayedTrack.artistName}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm">No recently played track available.</p>
            )}
          </div>

          {/* Top 4 Favorite Tracks */}
          <div className="flex flex-col items-center">
            <h3 className="text-md font-bold mb-2 text-purple-500">Top 4 Tracks</h3>
            <div className="flex justify-center space-x-4">
              {friend.topTracks?.map((track, index) => (
                <div key={index} className="flex flex-col items-center text-purple-500">
                  <img src={track.albumImage} alt={`Album cover for ${track.trackName}`} width={60} height={60} className="rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  ))
)}



        </div>        
        )}

          {/* NAVBAR */}
          <div className="fixed bottom-0 w-full grid grid-cols-4 gap-8 px-4 py-4 w-full justify-center items-center" style={{ backgroundColor: '#6C2DEB' }}>
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

{showPopup && (
  <div className="popup fixed top-[100px] left-0 right-0 bottom-20 z-40 flex flex-col justify-between text-white" style={{ backgroundColor: '#6C2DEB' }}>

    {/* Top half: Name, Points, and Cancel Button */}
    <div className="flex flex-col justify-center h-1/5 p-7">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          <Image
            src={`/blankpfp.png`}  // Replace with the correct path to the user's profile picture
            alt={`${selectedFriend?.name} Profile`}
            width={50}
            height={50}
            className="rounded-full mr-2"
          />
          <h3 className="font-bold text-xl">{selectedFriend?.name}</h3>
        </div>
        <h3 className="font-bold text-xl">{(selectedFriend?.points + selectedFriend.listeningMinutes).toFixed(2)} pts</h3>
      </div>
      <button 
        onClick={() => setShowPopup(false)} 
        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center"
        aria-label="Close"
      >
        &times;
      </button>
    </div>

    {/* Bottom half: Field to send song quest */}
    <div className="flex flex-col h-4/5 p-7 justify-between" style={{ backgroundColor: '#DED0FF' }}>
      <form onSubmit={handleFormSubmit} className="flex flex-col h-full justify-between">
        <label className="block mb-4">
          <input 
            type="text" 
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            className="w-full p-3 mt-2 border border-gray-300 rounded-full text-black"
            placeholder='Search for song'
          />
        </label>
        {loading && (
        <p className="mt-2 text-center">Sending song quest...</p>
      )}
        <div className="flex justify-center">
          <button type="submit" className="bg-green-500 text-white py-3 px-6 rounded-full w-full" style={{ backgroundColor: '#519804' }}>
            Send Song Quest
          </button>
        </div>
      </form>
    </div>

  </div>
)}




    </div>
  );
}
