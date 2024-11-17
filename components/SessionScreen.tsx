// SessionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause } from 'lucide-react-native';
import Timer from './Timer';
import BreathingCircle from './BreathingCircle';
import DebugSignal from "@/components/ui/debug_Signal";
import { isRunningInProduction } from '@/constants/production';
import { useBreathingData } from '@/hooks/useBreathingData';
import * as Haptics from 'expo-haptics';
import { PermissionsAndroid } from 'react-native';
import { useSound } from '@/hooks/useSound';

async function requestVibrationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.VIBRATE,
            {
                title: "Vibration Permission",
                message: "This app needs access to vibrate your device.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the vibration");
        } else {
            console.log("Vibration permission denied");
        }
    } catch (err) {
        console.warn(err);
    }
}

export default function SessionScreen() {
    const [isActive, setIsActive] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds

    const { playSound, pauseSound, selectSound, soundFiles } = useSound({
        soundAssets: require.context('../assets/sounds', true, /\.mp3$/),
    });

    const cheerSound = soundFiles.find(sound => sound.includes('ouenn')) || '';
    const keepGoingSound = soundFiles.find(sound => sound.includes('keep')) || '';

    useEffect(() => {
        requestVibrationPermission();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const { breathingType } = useBreathingData();

    useEffect(() => {
        if (breathingType.startsWith("深呼吸")) {
            selectSound(cheerSound);
            
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    }, [breathingType]);

    return (
        <View style={styles.container}>
            {__DEV__ && !isRunningInProduction && <DebugSignal />}
            <Timer time={formatTime(timeRemaining)} />
            <BreathingCircle />

            <TouchableOpacity
                style={styles.pauseButton}
                onPress={() => setIsActive(!isActive)}
            >
                {/* <Pause color="white" size={24} /> */}
                {isActive ? <Pause color="white" size={24} /> : <Play color="white" size={24} />}
                {/* <Text style={styles.pauseButtonText}>一時停止</Text> */}
                <Text style={styles.pauseButtonText}>{isActive ? '一時停止' : '再開'}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pauseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 8,
        width: '100%',
        borderWidth: 1,
        borderColor: '#334155',
    },
    pauseButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
});