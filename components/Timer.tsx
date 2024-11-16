import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TimerProps {
    time: string;
}

export default function Timer({ time }: TimerProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.label}>残り時間</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    time: {
        fontSize: 64,
        fontWeight: '300',
        color: 'white',
    },
    label: {
        fontSize: 16,
        color: '#94a3b8',
    },
});