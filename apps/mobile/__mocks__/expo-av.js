/**
 * Mock for expo-av
 * Provides stub implementations for Audio module
 */

const Audio = {
  Sound: {
    createAsync: jest.fn().mockResolvedValue({
      sound: {
        playAsync: jest.fn().mockResolvedValue({}),
        replayAsync: jest.fn().mockResolvedValue({}),
        pauseAsync: jest.fn().mockResolvedValue({}),
        stopAsync: jest.fn().mockResolvedValue({}),
        unloadAsync: jest.fn().mockResolvedValue({}),
        setVolumeAsync: jest.fn().mockResolvedValue({}),
        setPositionAsync: jest.fn().mockResolvedValue({}),
        getStatusAsync: jest.fn().mockResolvedValue({
          isLoaded: true,
          isPlaying: false,
          positionMillis: 0,
          durationMillis: 0,
        }),
      },
      status: { isLoaded: true },
    }),
  },
  setAudioModeAsync: jest.fn().mockResolvedValue({}),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
};

const Video = {
  // Add Video mock if needed
};

module.exports = {
  Audio,
  Video,
};
