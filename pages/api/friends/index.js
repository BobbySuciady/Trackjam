import { getSession } from 'next-auth/react';
import User from '../../../models/User';

export default async function handler(req, res) {
  const body = {...req.body} ;
req.body = null ;
const session = await getSession({ req:req });
req.body = body ;
  
  console.log("this is the session");
  console.log(req);

  if (!session) {
    console.log('No session found'); // Log for debugging
    return res.status(401).json({ message: 'Unauthorized' });
  }

  console.log('Session:', session); // Log the session

  try {
    const currentUser = await User.findOne({
      where: { email: session.user.email },
      include: { model: User, as: 'Friends' }
    });

    console.log('Current User:', currentUser);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.method === 'GET') {
      // Check if friends are being loaded correctly
      console.log('Friends:', currentUser.Friends);

      // Get friends data
      const friendsData = currentUser.Friends.map(friend => ({
        id: friend.id,
        name: friend.name,
        points: friend.points,
        listeningMinutes: friend.listeningMinutes,
      }));

      return res.status(200).json(friendsData);
    } else if (req.method === 'POST') {
      const { friendEmail } = req.body;
      const friend = await User.findOne({ where: { email: friendEmail } });

      if (!friend) {
        return res.status(404).json({ message: 'Friend not found' });
      }

      // Add friend relationship
      await currentUser.addFriend(friend); // Make sure addFriend exists and is working
      return res.status(200).json({ message: 'Friend added successfully' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error fetching friends data:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
