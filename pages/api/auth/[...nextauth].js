// pages/api/auth/[...nextauth].js
import NextAuth from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';
import sequelize from '../../../lib/sequelize';
import User from '../../../models/User';
import { getTodayListeningMinutes } from '../../../lib/spotify';

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: 'https://accounts.spotify.com/authorize?scope=user-read-email user-read-recently-played user-read-currently-playing',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Synchronize all defined models with the database
        await sequelize.sync();

        // Check if the user exists in the database, otherwise create a new user
        const [existingUser, created] = await User.findOrCreate({
          where: { email: user.email },
          defaults: {
            name: user.name,
            spotifyId: profile.id,
          },
        });

        if (created) {
          console.log(`New user created: ${user.email}`);
        }

        return true;
      } catch (error) {
        console.error('Error during sign-in:', error);
        return true;
      }
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;

      // Fetch today's listening minutes
      if (token.accessToken) {
        const minutesListenedToday = await getTodayListeningMinutes(token.accessToken);
        session.user.minutesListenedToday = minutesListenedToday;

        // Update the user's listening minutes in the database
        await User.update(
          { listeningMinutes: minutesListenedToday },
          { where: { email: session.user.email } }
        );
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});
