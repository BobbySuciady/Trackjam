// pages/api/user/index.js
import { getSession } from 'next-auth/react';
import User from '../../../models/User';
import { getLastPlayedTrack, getTodayListeningMinutes } from '../../../lib/spotify';

export default async function handler(req, res) {
    const session = await getSession({ req });

    if (!session) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const currentUser = await User.findOne({ where: { email: session.user.email } });

        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract the Spotify access token from the Authorization header
        const authHeader = req.headers.authorization;
        const spotifyAccessToken = authHeader && authHeader.split(' ')[1]; 
        console.log(spotifyAccessToken);// Get the token part after "Bearer"

        if (spotifyAccessToken) {
            // Get today's listening minutes
            const listeningMinutes = await getTodayListeningMinutes(spotifyAccessToken);
            const lastPlayedTrack = await getLastPlayedTrack(spotifyAccessToken);

            // Update the user's listening minutes in the database
            currentUser.listeningMinutes = listeningMinutes;
            currentUser.lastPlayedTrackName = lastPlayedTrack?.trackName || null;
            currentUser.lastPlayedTrackAlbumImage = lastPlayedTrack?.albumImage || null;
            currentUser.lastPlayedTrackArtist = lastPlayedTrack?.artistName || null;

            await currentUser.save();
        } else {
            console.warn('No Spotify access token provided in the Authorization header.');
        }

        return res.status(200).json({
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.name,
            spotifyId: currentUser.spotifyId,
            points: currentUser.points,
            listeningMinutes: currentUser.listeningMinutes,
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
