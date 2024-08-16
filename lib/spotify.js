// lib/spotify.js
import axios from 'axios';

export const getTodayListeningMinutes = async (accessToken) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).getTime();

    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        after: todayStart,
        limit: 50, // You can adjust this limit as needed
      },
    });

    const tracks = response.data.items;
    const totalMinutes = tracks.reduce((acc, track) => {
      const trackDurationMs = track.track.duration_ms;
      const playedAt = new Date(track.played_at).getTime();

      // Only include tracks played after 12 AM today
      if (playedAt >= todayStart) {
        return acc + trackDurationMs / 60000; // Convert ms to minutes and add to accumulator
      }

      return acc;
    }, 0);

    return totalMinutes.toFixed(2);
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    return 0;
  }
};
