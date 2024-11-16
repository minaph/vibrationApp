import { useCallback, useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { Audio } from "expo-av";
import { Picker } from '@react-native-picker/picker';

const soundAssets = require.context('../assets/sounds', true, /\.mp3$/);
console.log(soundAssets.keys());

export default function SoundControl() {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedSound, setSelectedSound] = useState<keyof typeof soundAssets | null>(null);

    // バックグラウンド再生の設定
    async function configureAudioMode() {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true, // バックグラウンド再生を有効にする
            playsInSilentModeIOS: true, // iOSでサイレントモードでも再生
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
    }

    const playSound = useCallback(async () => {
        if (!selectedSound) {
            return;
        }
        console.log("play")
        console.assert(soundAssets[selectedSound], "Invalid sound selected");
        const { sound: audioInstance } = await Audio.Sound.createAsync(
            soundAssets(selectedSound),
            { shouldPlay: false, isLooping: true }
        );
        setSound(audioInstance);
        if (isPlaying) {
            await audioInstance.playAsync();
        }
    }, [selectedSound, isPlaying]);

    useEffect(() => {
        configureAudioMode(); // 音楽モードを設定
        playSound(); // 音楽を再生

        // コンポーネントがアンマウントされたときにサウンドを解放
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [isPlaying]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Sound Control</Text>
            <Button
                title={isPlaying ? "Pause" : "Play"}
                onPress={async () => {
                    if (isPlaying) {
                        await sound?.pauseAsync();
                    } else {
                        await sound?.playAsync();
                    }
                    setIsPlaying(!isPlaying);
                }}
            />
            <Text>selected: {selectedSound}</Text>

            <Picker
                selectedValue={selectedSound}
                onValueChange={(itemValue) => {
                    if (sound) {
                        sound.unloadAsync();
                    }
                    setSound(null);
                    setSelectedSound(itemValue);
                }}
                style={{
                    fontSize: 20,
                    height: 50,
                    width: 150,
                }}
            >
                {soundAssets.keys().map((sound) => (
                    <Picker.Item key={sound} label={sound} value={sound} />
                ))}
            </Picker>
        </View>
    );
}