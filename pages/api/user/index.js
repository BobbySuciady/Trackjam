// pages/api/user/index.js
import { getSession } from 'next-auth/react';
import User from '../../../models/User';

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

    return res.status(200).json({
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      spotifyId: currentUser.spotifyId,
      listeningMinutes: currentUser.listeningMinutes,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
