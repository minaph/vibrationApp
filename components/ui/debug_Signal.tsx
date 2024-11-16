// App.tsx

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useBreathingData } from '@/hooks/useBreathingData';
import Graph from '../Graph';

export default function App() {
    const history = useBreathingData();

    const renderIntervals = () => {
        const { maxToMin, minToMax } = history.intervals;

        const getLastThreeIntervals = (intervals: { interval: number }[]) => {
            if (intervals.length === 0) return [];
            return intervals.slice(-3).map(i => i.interval.toFixed(2));
        };

        const lastThreeInhale = getLastThreeIntervals(maxToMin);
        const lastThreeExhale = getLastThreeIntervals(minToMax);

        return (
            <View style={styles.intervalsContainer}>
                <Text style={styles.breathingInfo}>
                    呼吸タイプ: {history.breathingType}{'\n'}
                    {history.breathingDetail}
                </Text>
                <Text style={styles.intervalText}>
                    直近の吸気時間: {lastThreeInhale.join(', ')}秒
                </Text>
                <Text style={styles.intervalText}>
                    直近の呼気時間: {lastThreeExhale.join(', ')}秒
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>呼吸パターン分析</Text>
            {renderIntervals()}
            <Graph
                data={history.y}
                range={history.yRange}
                color="#0066ff"
                label="Y軸生データ"
                showPeaks={false}
                history={history}
            />
            <Graph
                data={history.yMA}
                range={history.yMARange}
                color="#ff6600"
                label="Y軸移動平均"
                showPeaks={true}
                history={history}
            />
            <Graph
                data={history.yDeviation}
                range={history.yDeviationRange}
                color="#00cc00"
                label="Y軸偏差"
                showPeaks={false}
                history={history}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 50,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    breathingInfo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
        textAlign: 'center',
    },
    intervalsContainer: {
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    intervalText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        lineHeight: 20,
    },
});
