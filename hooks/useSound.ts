import { useCallback, useEffect, useState, useRef } from "react";
import { Audio } from "expo-av";

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
  isLoading: boolean;
  selectedSound: string | null;
  playSound: () => Promise<void>;
  pauseSound: () => Promise<void>;
  selectSound: (soundId: string) => void;
  soundFiles: string[];
  resetSound: () => Promise<void>;
}

export const useSound = ({ soundAssets }: UseSoundOptions): UseSoundReturn => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [isLoadedSuccessfully, setIsLoadedSuccessfully] = useState(false);
  const playbackStatus = useRef<any>(null);
  const loadingPromise = useRef<Promise<void> | null>(null);

  const onPlaybackStatusUpdate = (status: any) => {
    playbackStatus.current = status;
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setIsLoadedSuccessfully(true);

      if (status.didJustFinish) {
        setIsPlaying(false);
        sound?.setPositionAsync(0);
      }
    }
  };

  const configureAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error("Error configuring audio mode:", error);
    }
  };

  const loadSound = useCallback(async () => {
    if (!selectedSound) return;

    // 既に読み込み中の場合は待機
    if (loadingPromise.current) {
      await loadingPromise.current;
      return;
    }

    try {
      setIsLoading(true);
      setIsLoadedSuccessfully(false);
      console.log("Loading sound:", selectedSound);

      if (sound) {
        await sound.unloadAsync();
      }

      loadingPromise.current = (async () => {
        const { sound: audioInstance } = await Audio.Sound.createAsync(
          soundAssets(selectedSound),
          {
            shouldPlay: false,
            isLooping: false,
            positionMillis: 0,
            volume: 1.0,
          },
          onPlaybackStatusUpdate
        );

        const status = await audioInstance.getStatusAsync();
        if (!status.isLoaded) {
          throw new Error("Sound failed to load");
        }

        setSound(audioInstance);
        setIsLoadedSuccessfully(true);
        console.log("Sound loaded successfully", selectedSound, status);
      })();

      await loadingPromise.current;
    } catch (error) {
      console.error("Error loading sound:", error);
      setIsLoadedSuccessfully(false);
    } finally {
      setIsLoading(false);
      loadingPromise.current = null;
    }
  }, [selectedSound, soundAssets]);

  const playSound = async () => {
    try {
      if (!sound || !isLoadedSuccessfully) {
        await loadSound();
      }

      // ロードが完了するまで待機
      if (!isLoadedSuccessfully) {
        await new Promise<void>((resolve) => {
          const checkLoaded = setInterval(() => {
            if (isLoadedSuccessfully) {
              clearInterval(checkLoaded);
              resolve();
            }
          }, 100);
        });
      }

      const status = await sound?.getStatusAsync();
      if (status?.isLoaded) {
        if (sound && status.durationMillis && status.positionMillis >= status.durationMillis - 100) {
          await sound.setPositionAsync(0);
        }
        setIsPlaying(true);
        await sound?.playAsync();
      } else {
        throw new Error("Sound not properly loaded");
      }
    } catch (error) {
      console.error("Error playing sound:", error);
      await loadSound(); // エラー時は再ロードを試みる
    }
  };

  const pauseSound = async () => {
    try {
      if (sound && isLoadedSuccessfully) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing sound:", error);
    }
  };

  const selectSound = async (soundId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setSound(null);
      setIsPlaying(false);
      setIsLoadedSuccessfully(false);
      setSelectedSound(soundId);
    } catch (error) {
      console.error("Error selecting sound:", error);
    }
  };

  const resetSound = async () => {
    try {
      if (sound && isLoadedSuccessfully) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error resetting sound:", error);
    }
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
    isLoading,
    selectedSound,
    playSound,
    pauseSound,
    selectSound,
    soundFiles: soundAssets.keys(),
    resetSound,
  };
};