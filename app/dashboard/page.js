"use client";

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [songTitle, setSongTitle] = useState('');

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("Session:", session);

      const fetchUserData = async () => {
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
      };
  
      fetchUserData();
    }
  }, [session, status]);

  const sendSongQuest = (friend) => {
    setSelectedFriend(friend);
    setShowPopup(true);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (status === "authenticated" && session && selectedFriend) {
      try {
        console.log("Sending song quest to:", selectedFriend.name);

        // Send POST request to update points for the user and specific friend
        const response = await axios.post('/api/user/points', { action: 'add', friendId: selectedFriend.id }, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        // Fetch updated user data after points update
        const updatedUser = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setUser(updatedUser.data);

        // Fetch updated friends data
        const friendsResponse = await axios.get('/api/friends', {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        setFriendsData(friendsResponse.data);

        // Close the popup after sending the quest
        setShowPopup(false);
        setSongTitle('');
        setSelectedFriend(null);

      } catch (error) {
        console.error('Error sending song quest:', error);
      }
    }
  };

  const addFriend = async () => {
    if (status === "authenticated" && session) {
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
    }
  };
  
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You need to be logged in to view this page.</p>;
  }

  return (
    <div>
      <h1>Your Listening Minutes</h1>
      <p>You have listened to {user?.listeningMinutes || 0} minutes of music today.</p>

      <h1>Your Points</h1>
      <p>You have {user?.points || 0} points.</p>

      <h2>Your Friends' Stats</h2>
      <ul>
        {friendsData.length === 0 ? (
          <p>No friends data available.</p>
        ) : (
          friendsData.map((friend) => (
            <li key={friend.id}>
              {friend.name}: {friend.listeningMinutes?.toFixed(2) || 0} minutes and {friend.points?.toFixed(2) || 0} points
              <button onClick={() => sendSongQuest(friend)}>Send Song Quest</button>
            </li>
          ))
        )}
      </ul>

      <h3>Add a Friend</h3>
      <input
        type="email"
        value={friendEmail}
        onChange={(e) => setFriendEmail(e.target.value)}
        placeholder="Friend's Email"
      />
      <button onClick={addFriend}>Add Friend</button>

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
