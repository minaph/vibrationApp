import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Button } from 'react-native';
import { Gyroscope } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line, Circle, Text as SvgText } from 'react-native-svg';

const WINDOW_WIDTH = Dimensions.get('window').width;
const GRAPH_HEIGHT = 80;
const MAX_DATA_POINTS = 150;  // 15秒分のデータ (10Hz)
const MA_WINDOW = 5;    // 0.5秒の移動平均
const SAMPLE_RATE = 10; // 10Hz
const MIN_PEAK_DISTANCE = 10; // 最小ピーク間距離（サンプル数）

// フィルタとピーク検出のパラメータ
const FILTER_ALPHA = 0.1;  // ローパスフィルタの係数
const PEAK_THRESHOLD = 0.1; // ピーク検出の閾値

export default function App() {
    const [currentData, setCurrentData] = useState({ x: 0, y: 0, z: 0 });
    const [history, setHistory] = useState({
        raw: Array(MAX_DATA_POINTS).fill(0),
        filtered: Array(MAX_DATA_POINTS).fill(0),
        peaks: [],
        breathingPeriods: [],
        timestamp: Array(MAX_DATA_POINTS).fill(Date.now()),
        currentBreathingType: 'Unknown',
    });

    const [allAccData, setAllAccData] = useState<[number, number, number, number][]>([]);
    const [allGyroData, setAllGyroData] = useState<[number, number, number, number][]>([]);

    // ローパスフィルタの実装
    const lowPassFilter = (newValue: number, prevFiltered: number) => {
        return FILTER_ALPHA * newValue + (1 - FILTER_ALPHA) * prevFiltered;
    };

    // ピーク検出の実装
    const detectPeaks = (data: string | any[], timestamps: any[]) => {
        const peaks = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i - 1] && data[i] > data[i + 1] &&
                Math.abs(data[i] - data[i - 1]) > PEAK_THRESHOLD) {

                // 最小距離チェック
                if (peaks.length === 0 ||
                    (i - peaks[peaks.length - 1].index) >= MIN_PEAK_DISTANCE) {
                    peaks.push({
                        index: i,
                        value: data[i],
                        timestamp: timestamps[i]
                    });
                }
            }
        }
        return peaks;
    };

    // 呼吸周期の計算と種類の判定
    const analyzeBreathing = (peaks: any[]): { period: number; type: string; }[] => {
        if (peaks.length < 2) return [];

        const periods = [];
        for (let i = 1; i < peaks.length; i++) {
            const period = (peaks[i].timestamp - peaks[i - 1].timestamp) / 1000; // 秒に変換
            const type = period >= 7 && period <= 15 ? '腹式呼吸' :
                period >= 1 && period < 7 ? '肺式呼吸' : '不明';
            periods.push({ period, type });
        }
        return periods;
    };

    // 現在の呼吸タイプの判定
    const determineCurrentBreathingType = (periods: Array<{ period: number; type: string }>) => {
        if (periods.length === 0) return '計測中...';

        // 直近3回の呼吸を分析
        const recentPeriods = periods?.slice(-3);
        const typeCount = recentPeriods.reduce((acc: { [x: string]: any; }, curr: { type: string | number; }) => {
            acc[curr.type] = (acc[curr.type] || 0) + 1;
            return acc;
        }, {});

        // 最も多い種類を返す
        return Object.entries(typeCount)
            .sort(([, a], [, b]) => b - a)[0][0];
    };

    useEffect(() => {
        let subscription;

        const enableGyroscope = async () => {
            try {
                // ジャイロセンサーが利用可能か確認
                const isAvailable = await Gyroscope.isAvailableAsync();
                if (!isAvailable) {
                    alert('ジャイロセンサーが利用できません');
                    return;
                }

                await Gyroscope.setUpdateInterval(100); // 10Hz
                subscription = Gyroscope.addListener(data => {
                    setAllGyroData(prev => {
                        return [...prev, [data.x, data.y, data.z, data.timestamp]];
                    });
                });
            } catch (error) {
                alert('ジャイロセンサーの初期化に失敗しました: ' + error.message);
            }
        };

        enableGyroscope();
        return () => subscription && subscription.remove();
    }, []);

    useEffect(() => {
        let subscription: { remove: any; };

        const enableAccelerometer = async () => {
            Accelerometer.setUpdateInterval(100); // 10Hz
            subscription = Accelerometer.addListener(data => {
                setCurrentData(data);

                setAllAccData(prev => {
                    return [...prev, [data.x, data.y, data.z, data.timestamp]];
                });
            });
        };

        enableAccelerometer();
        return () => subscription && subscription.remove();
    }, []);

    const renderGraph = () => {
        // 生データのプロット点
        const rawPoints = history.raw.map((value, index) => {
            const x = (index * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
            const y = GRAPH_HEIGHT / 2 - (value * GRAPH_HEIGHT / 4);
            return `${x},${y}`;
        }).join(' ');

        // フィルタ後のデータのプロット点
        const filteredPoints = history.filtered.map((value, index) => {
            const x = (index * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
            const y = GRAPH_HEIGHT / 2 - (value * GRAPH_HEIGHT / 4);
            return `${x},${y}`;
        }).join(' ');

        return (
            <View style={styles.graphContainer}>
                <Text style={styles.label}>
                    呼吸パターン: {history.currentBreathingType}
                </Text>
                {history.breathingPeriods.length > 0 && (
                    <Text style={styles.label}>
                        最新の周期: {history.breathingPeriods[history.breathingPeriods.length - 1]?.period.toFixed(1)}秒
                    </Text>
                )}
                <Svg height={GRAPH_HEIGHT} width={WINDOW_WIDTH - 40}>
                    <Line
                        x1="0"
                        y1={GRAPH_HEIGHT / 2}
                        x2={WINDOW_WIDTH - 40}
                        y2={GRAPH_HEIGHT / 2}
                        stroke="#cccccc"
                        strokeWidth="1"
                    />
                    {/* 生データ */}
                    <Polyline
                        points={rawPoints}
                        fill="none"
                        stroke="#dddddd"
                        strokeWidth="1"
                    />
                    {/* フィルタ後のデータ */}
                    <Polyline
                        points={filteredPoints}
                        fill="none"
                        stroke="#0066ff"
                        strokeWidth="2"
                    />
                    {/* ピークのプロット */}
                    {history.peaks.map((peak, index) => {
                        if (peak.index >= history.filtered.length - MAX_DATA_POINTS) {
                            const x = ((peak.index % MAX_DATA_POINTS) * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
                            const y = GRAPH_HEIGHT / 2 - (peak.value * GRAPH_HEIGHT / 4);
                            return (
                                <Circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="#ff0000"
                                />
                            );
                        }
                        return null;
                    })}
                </Svg>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Button title="log history" onPress={() => console.log("history", {
                gyro: allGyroData,
                acc: allAccData
            })} />
            <Button title="reset history" onPress={() => {
                setAllGyroData([]);
                setAllAccData([]);
            }} />
            <Text style={styles.title}>呼吸パターン分析</Text>
            {renderGraph()}
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
        marginBottom: 20,
    },
    graphContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
});