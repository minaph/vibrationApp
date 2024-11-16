import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Flower2 } from 'lucide-react-native';

export default function Logo() {
    return (
        <View style={styles.container}>
            <Flower2 color="#475569" size={48} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 128,
        height: 128,
        backgroundColor: '#f1f5f9',
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
    },
});