// app/dashboard/page.js
"use client";

import { signIn, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [friendsData, setFriendsData] = useState([]);
  const [friendEmail, setFriendEmail] = useState('');

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Session:", session); // Log the session for debugging
  
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
  

  const addFriend = async () => {
    try {
      console.log("AccessToken:", session.accessToken); // Log the token for debugging
  
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
  
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>You need to be logged in to view this page.</p>;
  }

  return (
    <div>
      <h1>Your Listening Minutes</h1>
      <p>You have listened to {session.user.minutesListenedToday} minutes of music today.</p>
      
      <h2>Your Friends Listening Minutes</h2>
      <ul>
        {friendsData.length === 0 ? (
          <p>No friends data available.</p>
        ) : (
          friendsData.map((friend) => (
            <li key={friend.id}>
              {friend.name}: {friend.listeningMinutes?.toFixed(2) || 0} minutes
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
    </div>
  );
}
