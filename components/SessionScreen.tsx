// SessionScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Pause } from 'lucide-react-native';
import Timer from './Timer';
import BreathingCircle from './BreathingCircle';
import DebugSignal from "@/components/ui/debug_Signal";
import { isRunningInProduction } from '@/constants/production';

export default function SessionScreen() {
    const [isActive, setIsActive] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds

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

    return (
        <View style={styles.container}>
            {__DEV__ && !isRunningInProduction && <DebugSignal />}
            <Timer time={formatTime(timeRemaining)} />
            <BreathingCircle />

            <TouchableOpacity
                style={styles.pauseButton}
                onPress={() => setIsActive(!isActive)}
            >
                <Pause color="white" size={24} />
                <Text style={styles.pauseButtonText}>一時停止</Text>
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