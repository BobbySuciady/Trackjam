"use client";

import Image from 'next/image';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function OnboardingPage() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div style={styles.container}>
        {/* Welcome Screen */}
        <h1>Welcome, {session.user.name}!</h1>
        <p>You're logged in with Spotify.</p>
        <p>Let's continue your music journey with TrackJam.</p>
        
        {/* Sign Out Button */}
        <button style={styles.signoutButton} onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Onboarding Screen */}
      <div style={styles.headerImage}>
        <Image
          src="/headerPicture.png"
          alt="Piano Tiles"
          layout="responsive"
          width={1000} // Adjust dimensions as needed
          height={500} // Adjust dimensions as needed
          priority // Ensures this image is loaded first
        />
      </div>

      <div style={styles.logoImage}>
        <Image
          src="/trackJamLogo.png"
          alt="TrackJam Logo"
          layout="intrinsic"
          width={200} // Adjust dimensions as needed
          height={100} // Adjust dimensions as needed
        />
      </div>

      <div style={styles.textSection}>
        <h1>Stream, team, and reign supreme with TrackJam!</h1>
        <p>
          Compare your Spotify listening minutes, challenge friends, and climb the leaderboard.
          Share song recommendations to earn points and expand your musical horizons.
        </p>
      </div>

      <div style={styles.buttonContainer}>
        <button style={styles.signupButton} onClick={() => signIn('spotify')}>
          Sign up with Spotify
        </button>
        <button style={styles.loginButton} disabled>
          Log in
        </button>
      </div>
    </div>
  );
}

// Styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    textAlign: 'center',
  },
  headerImage: {
    marginBottom: '20px',
  },
  logoImage: {
    marginBottom: '20px',
  },
  textSection: {
    marginBottom: '40px',
    color: '#333',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  signupButton: {
    backgroundColor: '#1DB954', // Spotify green
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loginButton: {
    backgroundColor: '#ddd', // Greyed-out color
    color: '#666',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
    fontSize: '16px',
  },
  signoutButton: {
    backgroundColor: '#ff4b4b', // A red color for the sign-out button
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
  },
};
