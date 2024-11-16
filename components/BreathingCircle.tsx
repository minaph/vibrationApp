import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Bell } from 'lucide-react-native';

export default function BreathingCircle() {
    return (
        <View style={styles.container}>
            <View style={styles.outerCircle} />
            <View style={styles.progressCircle} />
            <View style={styles.iconContainer}>
                <Bell color="#94a3b8" size={48} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 192,
        height: 192,
        position: 'relative',
    },
    outerCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 96,
        borderWidth: 4,
        borderColor: '#334155',
    },
    progressCircle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 96,
        borderWidth: 4,
        borderColor: '#4f46e5',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        transform: [{ rotate: '-45deg' }],
    },
    iconContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
});