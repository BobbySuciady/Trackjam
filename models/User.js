import { DataTypes } from 'sequelize';
import sequelize from '../lib/sequelize';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: DataTypes.STRING,
  spotifyId: {
    type: DataTypes.STRING,
    unique: true,
  },
  points: {
    type: DataTypes.FLOAT,
    defaultValue: 100,
  },
  listeningMinutes: DataTypes.FLOAT,
  lastPlayedTrackName: DataTypes.STRING, // New field for the track name
  lastPlayedTrackArtist: DataTypes.STRING, // New field for the artist name
  lastPlayedTrackAlbumImage: DataTypes.STRING, // New field for the album image URL
});

// Define the self-referencing many-to-many relationship
User.belongsToMany(User, { as: 'Friends', through: 'Friend', foreignKey: 'userId', otherKey: 'friendId' });

export default User;
