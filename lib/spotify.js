import axios from 'axios';

// Function to get today's listening minutes
export async function getTodayListeningMinutes(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        limit: 50,
        after: new Date().setHours(0, 0, 0, 0), // Midnight of today
      },
    });

    // Calculate the total minutes listened today
    const totalMinutes = response.data.items.reduce((sum, item) => {
      return sum + item.track.duration_ms / 60000;
    }, 0);

    return totalMinutes;
  } catch (error) {
    console.error('Error fetching today\'s listening minutes:', error);
    return 0;
  }
}

// Function to get the last played track
export async function getLastPlayedTrack(accessToken) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        limit: 1, // Only fetch the most recent track
      },
    });

    const lastPlayedTrack = response.data.items[0]?.track;
    return lastPlayedTrack
      ? {
          trackName: lastPlayedTrack.name,
          artistName: lastPlayedTrack.artists.map((artist) => artist.name).join(', '),
          albumName: lastPlayedTrack.album.name,
          albumImage: lastPlayedTrack.album.images[0]?.url,
        }
      : null;
  } catch (error) {
    console.error('Error fetching last played track:', error);
    return null;
  }
}
