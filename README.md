<p align="center">
  <img src="https://github.com/BobbySuciady/Trackjam/blob/master/public/trackJamLogoSmall.png" alt="Small TrackJam logo">
</p>

# TrackJam: Listen, Track, and Compete! 🎵

Why wait for Spotify Wrapped on December when you can do it everyday?!
Flex your superior music taste on-demand and prove that you are the GOAT!

## What it does 

TrackJam is an innovative app that transforms your Spotify listening habits into a fun and competitive experience. It tracks how many minutes you spend listening to music each day and converts those minutes into points, allowing you to compete with friends on a leaderboard. You can send song Quests to your friends, and if they listen to the song, both of you earn points, adding a playful twist to discovering new music. The app also keeps you connected by letting you see what songs your friends last played and their favorite tracks. While others wait for their annual Spotify Wrapped, TrackJam offers a gamified version every day, turning your music listening into a social, everyday adventure.

## Main Features:

+ Integrated with your spotify (login & data)
+ Point leaderboard system based on your daily minutes listened
+ Get more points when you recommend music to your friends

## Test the WebApp 🚀 (on progress)

1. Go to https://catalysttrackjamfinal.vercel.app/ (preferably in incognito browser)
2. Press "Connect with Spotify"
3. Log in to spotify using the following test account --> e: catalystwinner@gmail.com p: TrackJam!!
4. Compare your music stats with your friends and see how much better you are!
5. Send Sound Quests to your friends to bless their ears and grant both of you points!
6. Tell the world share your stats on Instagram or other social media everyday!! (Coming soon)

## Deploy on your own local Machine 🤖

1. Clone Repository
2. Create a Spotify dev account, create project, and add a few users (spotify-connected emails) into the spotify project to allow access to project
3. Create a railway account and sql database
4. run `npm install`
5. Make .env.local file in project root directory 
6. Paste in SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET from your Spotify project and DATABASE_URL from railway in .env.local
7. run `npm run dev`
8. Open browser at http://localhost:3000/
9. Follow "Test the WebApp" guide above (use any account that you added to your spotify project)

## Technical Documentations (For the nerdsss) 🤓

<p align="center">
  <a href="https://www.figma.com/design/rUhvm55llHjEU9CCjjqp15/Catalyst-2024?node-id=0-1&t=1mcW85Fbs4yYhKk7-1" target="_blank"> Figma Design</a>
  <br>
  <br>
  <br>
  <br>
  <img src="https://github.com/BobbySuciady/Trackjam/blob/master/public/TrackJamArchitectureDiagram.png" alt="TrackJam Architectural Diagram">
</p>

## Disclaimer ⚠️

TrackJam webapp intended for demo version only, further development will be made for iOS/Android mobile app.
API calls may take time, please be patient and refresh page if it takes more than 20s to load.
If compilation error occurs, try clearing cache and re-paste the root URL