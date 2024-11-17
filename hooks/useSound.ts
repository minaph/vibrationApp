import { useCallback, useEffect, useState } from 'react';
import { Audio } from "expo-av";

// 音声ファイルの型定義
interface SoundAssets {
  keys(): string[];
  (id: string): any;
}

interface UseSoundOptions {
  soundAssets: SoundAssets;
}

interface UseSoundReturn {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  selectedSound: string | null;
  playSound: () => Promise<void>;
  pauseSound: () => Promise<void>;
  selectSound: (soundId: string) => void;
  soundFiles: string[];
}

export const useSound = ({ soundAssets }: UseSoundOptions): UseSoundReturn => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);

  // バックグラウンド再生の設定
  const configureAudioMode = async () => {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  };

  const loadSound = useCallback(async () => {
    if (!selectedSound) return;

    try {
      console.log("Loading sound:", selectedSound);
      const { sound: audioInstance } = await Audio.Sound.createAsync(
        soundAssets(selectedSound),
        { shouldPlay: false, isLooping: false }
      );
      setSound(audioInstance);
    } catch (error) {
      console.error("Error loading sound:", error);
    }
  }, [selectedSound, soundAssets]);

  const playSound = async () => {
    try {
      if (!sound) {
        await loadSound();
      } else if (!sound._loaded) {
        console.assert(selectedSound, "selectedSound should be set");
        await loadSound();
      }
      await sound?.playAsync();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const pauseSound = async () => {
    try {
      await sound?.pauseAsync();
      setIsPlaying(false);
    } catch (error) {
      console.error("Error pausing sound:", error);
    }
  };

  const selectSound = (soundId: string) => {
    if (sound) {
      sound.unloadAsync();
    }
    setSound(null);
    setIsPlaying(false);
    setSelectedSound(soundId);
  };

  useEffect(() => {
    configureAudioMode();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSound) {
      loadSound();
    }
  }, [selectedSound, loadSound]);

  return {
    sound,
    isPlaying,
    selectedSound,
    playSound,
    pauseSound,
    selectSound,
    soundFiles: soundAssets.keys(),
  };
};