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
  const playbackStatus = useRef<any>(null);

  // 音声の状態を監視するコールバック
  const onPlaybackStatusUpdate = (status: any) => {
    playbackStatus.current = status;
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);

      // 再生が終了した場合
      if (status.didJustFinish) {
        setIsPlaying(false);
        // 位置を最初に戻す
        sound?.setPositionAsync(0);
      }
    }
  };

  // バックグラウンド再生の設定
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

  // 音声のロード処理
  const loadSound = useCallback(async () => {
    if (!selectedSound) return;

    try {
      setIsLoading(true);
      console.log("Loading sound:", selectedSound);

      // 既存の音声をアンロード
      if (sound) {
        await sound.unloadAsync();
      }

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

      // ロードが完了したことを確認
      const status = await audioInstance.getStatusAsync();
      if (!status.isLoaded) {
        throw new Error("Sound failed to load");
      }

      setSound(audioInstance);
      console.log("Sound loaded successfully");
    } catch (error) {
      console.error("Error loading sound:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSound, soundAssets]);

  // 音声の再生
  const playSound = async () => {
    try {
      if (!sound || !playbackStatus.current?.isLoaded) {
        await loadSound();
      }

      const status = await sound?.getStatusAsync();
      if (status?.isLoaded) {
        // 再生位置を確認し、必要に応じて最初から再生
        if (sound && status.durationMillis && status.positionMillis >= status.durationMillis - 100) {
          await sound.setPositionAsync(0);
        }
        await sound?.playAsync();
        setIsPlaying(true);
      } else {
        console.warn("Sound not properly loaded");
        await loadSound();
        await sound?.playAsync();
      }
    } catch (error) {
      console.error("Error playing sound:", error);
      // エラー時は再ロードを試みる
      await loadSound();
    }
  };

  // 音声の一時停止
  const pauseSound = async () => {
    try {
      if (sound && playbackStatus.current?.isLoaded) {
        await sound.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error pausing sound:", error);
    }
  };

  // 音声の選択
  const selectSound = async (soundId: string) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      setSound(null);
      setIsPlaying(false);
      setSelectedSound(soundId);
    } catch (error) {
      console.error("Error selecting sound:", error);
    }
  };

  // 音声のリセット
  const resetSound = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error resetting sound:", error);
    }
  };

  // 初期設定
  useEffect(() => {
    configureAudioMode();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // 音声選択時の処理
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
