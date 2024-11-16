// components/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface HomeScreenProps {
    onStartSession: () => void;
    onOpenSettings: () => void;
    onOpenGuide: () => void;
}


const HomeScreen: React.FC<HomeScreenProps> = ({
    onStartSession,
    onOpenSettings,
    onOpenGuide
}) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo} />
                </View>

                <Text style={styles.title}>禅道</Text>
                <Text style={styles.subtitle}>デジタル座禅アシスタント</Text>

                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={onStartSession}
                >
                    <Feather name="play" size={24} color="white" />
                    <Text style={styles.primaryButtonText}>セッション開始</Text>
                </TouchableOpacity>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onOpenSettings}
                    >
                        <Feather name="settings" size={24} color="#475569" />
                        <Text style={styles.secondaryButtonText}>設定</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={onOpenGuide}
                    >
                        <Feather name="info" size={24} color="#475569" />
                        <Text style={styles.secondaryButtonText}>ガイド</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#f1f5f9',
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    logo: {
        width: 60,
        height: 60,
        backgroundColor: '#cbd5e1',
        borderRadius: 30,
    },
    title: {
        fontSize: 32,
        fontFamily: 'NotoSansJP-Bold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'NotoSansJP-Regular',
        color: '#64748b',
        marginBottom: 48,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontFamily: 'NotoSansJP-Medium',
        marginLeft: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    secondaryButtonText: {
        color: '#475569',
        fontSize: 16,
        fontFamily: 'NotoSansJP-Medium',
        marginLeft: 8,
    },
});