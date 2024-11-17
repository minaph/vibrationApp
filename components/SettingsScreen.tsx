// SettingsScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Picker as SelectPicker } from '@react-native-picker/picker';
import SoundControl from './SoundControl';
import { isRunningInProduction } from '@/constants/production';
import DebugHaptics from '@/components/ui/debug_Haptics';


export default function SettingsScreen() {
    const [duration, setDuration] = useState('25');
    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>設定</Text>

            <View style={styles.section}>
                <Text style={styles.label}>セッション時間</Text>
                <SelectPicker
                    selectedValue={duration}
                    onValueChange={(itemValue) => setDuration(itemValue)}
                    style={styles.picker}
                >
                    <SelectPicker.Item label="15分" value="15" />
                    <SelectPicker.Item label="25分" value="25" />
                    <SelectPicker.Item label="40分" value="40" />
                    <SelectPicker.Item label="60分" value="60" />
                </SelectPicker>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>振動フィードバック</Text>
                <Switch
                    value={vibrationEnabled}
                    onValueChange={setVibrationEnabled}
                    trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
                    thumbColor={vibrationEnabled ? '#4f46e5' : '#f1f5f9'}
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>音声ガイド</Text>
                <Switch
                    value={voiceEnabled}
                    onValueChange={setVoiceEnabled}
                    trackColor={{ false: '#cbd5e1', true: '#818cf8' }}
                    thumbColor={voiceEnabled ? '#4f46e5' : '#f1f5f9'}
                />
            </View>

            {__DEV__ && !isRunningInProduction && <SoundControl />}
            {__DEV__ && !isRunningInProduction && <DebugHaptics />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#475569',
        marginBottom: 8,
    },
    picker: {
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
    },
});