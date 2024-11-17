import { View, Text, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSound } from '@/hooks/useSound';
import { Key } from 'react';

const soundAssets = require.context('../assets/sounds', true, /\.mp3$/);

export default function SoundControl() {
    const {
        isPlaying,
        selectedSound,
        playSound,
        pauseSound,
        selectSound,
        soundFiles
    } = useSound({ soundAssets });

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Sound Control</Text>
            <Button
                title={isPlaying ? "Pause" : "Play"}
                onPress={isPlaying ? pauseSound : playSound}
            />
            <Text>Selected: {selectedSound}</Text>

            <Picker
                selectedValue={selectedSound?.toString()}
                onValueChange={selectSound}
                style={{
                    fontSize: 20,
                    height: 50,
                    width: 150,
                }}
            >
                {soundFiles.map((sound: string) => (
                    <Picker.Item key={sound} label={sound} value={sound} />
                ))}
            </Picker>
        </View>
    );
}