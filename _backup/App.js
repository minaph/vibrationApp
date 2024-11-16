import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line, Circle, Rect } from 'react-native-svg';

const WINDOW_WIDTH = Dimensions.get('window').width;
const GRAPH_HEIGHT = 80;
const MAX_DATA_POINTS = 150; // 15秒分のデータ (10Hz)
const MA_WINDOW = 50;      // 5秒の移動平均 (10Hz)
const PEAK_THRESHOLD = 0.1; // ピーク検出の閾値
const PEAK_PATIENCE = 20;   // ピーク検出の待機時間（データポイント数）

export default function App() {
  const [history, setHistory] = useState({
    y: Array(MAX_DATA_POINTS).fill(0),
    yMA: Array(MAX_DATA_POINTS).fill(0),
    yDeviation: Array(MAX_DATA_POINTS).fill(0),
    peaks: {
      maxima: [],
      minima: []
    },
    intervals: {
      maxToMax: [],
      maxToMin: [], // 吸気時間
      minToMax: []  // 呼気時間
    },
    timestamp: Array(MAX_DATA_POINTS).fill(Date.now()),
    breathingType: 'unknown',
    breathingDetail: '',
    currentPeriod: 0,
    yRange: { min: -1, max: 1 },
    yMARange: { min: -1, max: 1 },
    yDeviationRange: { min: -1, max: 1 }
  });

  const calculateMA = (data, window) => {
    const recentData = data.slice(-window);
    return recentData.reduce((sum, val) => sum + val, 0) / window;
  };

  const calculateRange = (data) => {
    const validData = data.filter(x => !isNaN(x) && x !== null);
    if (validData.length === 0) return { min: -1, max: 1 };
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const margin = (max - min) * 0.1;
    return {
      min: min - margin,
      max: max + margin
    };
  };

  const detectPeaks = (data, timestamps) => {
    const maxima = [];
    const minima = [];
    let lastMaxIndex = -PEAK_PATIENCE;
    let lastMinIndex = -PEAK_PATIENCE;

    for (let i = PEAK_PATIENCE; i < data.length - PEAK_PATIENCE; i++) {
      const windowStart = i - PEAK_PATIENCE;
      const windowEnd = i + PEAK_PATIENCE;
      const windowData = data.slice(windowStart, windowEnd + 1);
      const currentValue = data[i];

      // 極大値の検出
      if (currentValue === Math.max(...windowData) &&
          i - lastMaxIndex >= PEAK_PATIENCE &&
          Math.abs(currentValue) > PEAK_THRESHOLD) {
        maxima.push({
          value: currentValue,
          timestamp: timestamps[i],
          index: i
        });
        lastMaxIndex = i;
      }

      // 極小値の検出
      if (currentValue === Math.min(...windowData) &&
          i - lastMinIndex >= PEAK_PATIENCE &&
          Math.abs(currentValue) > PEAK_THRESHOLD) {
        minima.push({
          value: currentValue,
          timestamp: timestamps[i],
          index: i
        });
        lastMinIndex = i;
      }
    }

    return { maxima, minima };
  };

  const calculateIntervals = (maxima, minima) => {
    const intervals = {
      maxToMax: [],
      maxToMin: [],  // 吸気時間
      minToMax: [],  // 呼気時間
    };

    // すべての極値を時系列順にソート
    const allPeaks = [...maxima, ...minima].sort((a, b) => a.timestamp - b.timestamp);

    // 極大値間の間隔
    for (let i = 1; i < maxima.length; i++) {
      const interval = (maxima[i].timestamp - maxima[i-1].timestamp) / 1000;
      intervals.maxToMax.push({
        interval,
        startTime: maxima[i-1].timestamp,
        endTime: maxima[i].timestamp
      });
    }

    // 連続する極値間の間隔を計算
    for (let i = 0; i < allPeaks.length - 1; i++) {
      const current = allPeaks[i];
      const next = allPeaks[i + 1];
      const interval = (next.timestamp - current.timestamp) / 1000;

      // 極大値から極小値への間隔（吸気）
      if (maxima.some(m => m.timestamp === current.timestamp) &&
          minima.some(m => m.timestamp === next.timestamp)) {
        intervals.maxToMin.push({
          interval,
          startTime: current.timestamp,
          endTime: next.timestamp
        });
      }
      // 極小値から極大値への間隔（呼気）
      else if (minima.some(m => m.timestamp === current.timestamp) &&
               maxima.some(m => m.timestamp === next.timestamp)) {
        intervals.minToMax.push({
          interval,
          startTime: current.timestamp,
          endTime: next.timestamp
        });
      }
    }

    return intervals;
  };

  // determineBreathingType関数を更新
const determineBreathingType = (intervals) => {
  const { maxToMin, minToMax } = intervals;
  
  if (maxToMin.length < 3 || minToMax.length < 3) {
    return { type: 'calculating...', period: 0, detail: '' };
  }

  // 直近3回の吸気・呼気時間を取得
  const recentInhales = maxToMin.slice(-3).map(interval => interval.interval);
  const recentExhales = minToMax.slice(-3).map(interval => interval.interval);

  // 移動平均を計算
  const avgInhale = recentInhales.reduce((sum, val) => sum + val, 0) / 3;
  const avgExhale = recentExhales.reduce((sum, val) => sum + val, 0) / 3;
  const avgTotalPeriod = avgInhale + avgExhale;

  // 安定性の評価（標準偏差を使用）
  const inhaleStdDev = Math.sqrt(
    recentInhales.reduce((sum, val) => sum + Math.pow(val - avgInhale, 2), 0) / 3
  );
  const exhaleStdDev = Math.sqrt(
    recentExhales.reduce((sum, val) => sum + Math.pow(val - avgExhale, 2), 0) / 3
  );

  // 呼吸の安定性を評価（標準偏差が0.5秒未満を安定とする）
  const isStable = inhaleStdDev < 0.5 && exhaleStdDev < 0.5;
  const stabilityStatus = isStable ? '安定' : '不安定';

  // 深呼吸の判定（吸気3秒以上、呼気5秒以内）
  if (avgInhale >= 3 && avgExhale <= 5) {
    return {
      type: `深呼吸 (${stabilityStatus})`,
      period: avgTotalPeriod,
      detail: `平均吸気: ${avgInhale.toFixed(1)}秒, 平均呼気: ${avgExhale.toFixed(1)}秒`
    };
  }
  // 通常の呼吸パターン判定
  else if (avgTotalPeriod >= 7 && avgTotalPeriod <= 15) {
    return {
      type: `腹式呼吸 (${stabilityStatus})`,
      period: avgTotalPeriod,
      detail: `平均吸気: ${avgInhale.toFixed(1)}秒, 平均呼気: ${avgExhale.toFixed(1)}秒`
    };
  } else if (avgTotalPeriod >= 1 && avgTotalPeriod < 7) {
    return {
      type: `胸式呼吸 (${stabilityStatus})`,
      period: avgTotalPeriod,
      detail: `平均吸気: ${avgInhale.toFixed(1)}秒, 平均呼気: ${avgExhale.toFixed(1)}秒`
    };
  } else {
    return {
      type: `判定不能 (${stabilityStatus})`,
      period: avgTotalPeriod,
      detail: `平均吸気: ${avgInhale.toFixed(1)}秒, 平均呼気: ${avgExhale.toFixed(1)}秒`
    };
  }
  };

  useEffect(() => {
    let subscription;

    const enableAccelerometer = async () => {
      await Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(data => {
        setHistory(prev => {
          const now = Date.now();
          
          const newHistory = {
            y: [...prev.y.slice(1), data.y],
            yMA: [...prev.yMA.slice(1)],
            yDeviation: [...prev.yDeviation.slice(1)],
            timestamp: [...prev.timestamp.slice(1), now],
          };

          // 移動平均の計算
          const yMA = calculateMA(newHistory.y, MA_WINDOW);
          newHistory.yMA.push(yMA);

          // 偏差の計算
          const deviation = data.y - yMA;
          newHistory.yDeviation.push(deviation);

          // ピーク検出と間隔計算
          const peaks = detectPeaks(newHistory.yMA, newHistory.timestamp);
          const intervals = calculateIntervals(peaks.maxima, peaks.minima);
          
          // 呼吸タイプの判定
          const breathing = determineBreathingType(intervals);

          return {
            ...newHistory,
            peaks,
            intervals,
            breathingType: breathing.type,
            breathingDetail: breathing.detail,
            currentPeriod: breathing.period,
            yRange: calculateRange(newHistory.y),
            yMARange: calculateRange(newHistory.yMA),
            yDeviationRange: calculateRange(newHistory.yDeviation)
          };
        });
      });
    };

    enableAccelerometer();
    return () => subscription && subscription.remove();
  }, []);

  const renderBreathingPhases = (data, range) => {
    const { maxToMin, minToMax } = history.intervals;
    const phases = [];

    // 吸気フェーズの描画（青色）
    maxToMin.forEach(interval => {
      const startIndex = history.timestamp.findIndex(t => t === interval.startTime);
      const endIndex = history.timestamp.findIndex(t => t === interval.endTime);
      if (startIndex >= 0 && endIndex >= 0) {
        const x = (startIndex * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
        const width = ((endIndex - startIndex) * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
        phases.push(
          <Rect
            key={`inhale-${interval.startTime}`}
            x={x}
            y={0}
            width={width}
            height={GRAPH_HEIGHT}
            fill="rgba(0, 0, 255, 0.1)"
          />
        );
      }
    });

    // 呼気フェーズの描画（赤色）
    minToMax.forEach(interval => {
      const startIndex = history.timestamp.findIndex(t => t === interval.startTime);
      const endIndex = history.timestamp.findIndex(t => t === interval.endTime);
      if (startIndex >= 0 && endIndex >= 0) {
        const x = (startIndex * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
        const width = ((endIndex - startIndex) * (WINDOW_WIDTH - 40)) / MAX_DATA_POINTS;
        phases.push(
          <Rect
            key={`exhale-${interval.startTime}`}
            x={x}
            y={0}
            width={width}
            height={GRAPH_HEIGHT}
            fill="rgba(255, 0, 0, 0.1)"
          />
        );
      }
    });

    return phases;
  };

  const renderGraph = (data, range, color, label, showPeaks = false) => {
    const points = data.map((value, index) => {
      const x = (index * (WINDOW_WIDTH - 40)) / (MAX_DATA_POINTS - 1);
      const normalizedValue = (value - range.min) / (range.max - range.min);
      const y = GRAPH_HEIGHT - (normalizedValue * GRAPH_HEIGHT);
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={styles.graphContainer}>
        <Text style={styles.label}>
          {label}: {data[data.length - 1].toFixed(3)}
        </Text>
        <Svg height={GRAPH_HEIGHT} width={WINDOW_WIDTH - 40}>
          {/* 呼吸フェーズの背景 */}
          {showPeaks && renderBreathingPhases(data, range)}
          
          {/* センターライン */}
          <Line
            x1="0"
            y1={GRAPH_HEIGHT / 2}
            x2={WINDOW_WIDTH - 40}
            y2={GRAPH_HEIGHT / 2}
            stroke="#cccccc"
            strokeWidth="1"
          />

          {/* データライン */}
          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />

          {/* ピークの描画 */}
          {showPeaks && history.peaks.maxima.map((peak, index) => {
            const x = (peak.index * (WINDOW_WIDTH - 40)) / (MAX_DATA_POINTS - 1);
            const normalizedValue = (data[peak.index] - range.min) / (range.max - range.min);
            const y = GRAPH_HEIGHT - (normalizedValue * GRAPH_HEIGHT);
            return (
              <Circle
                key={`max-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill="red"
              />
            );
          })}
          {showPeaks && history.peaks.minima.map((peak, index) => {
            const x = (peak.index * (WINDOW_WIDTH - 40)) / (MAX_DATA_POINTS - 1);
            const normalizedValue = (data[peak.index] - range.min) / (range.max - range.min);
            const y = GRAPH_HEIGHT - (normalizedValue * GRAPH_HEIGHT);
            return (
              <Circle
                key={`min-${index}`}
                cx={x}
                cy={y}
                r="4"
                fill="blue"
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  const renderIntervals = () => {
    const { maxToMin, minToMax } = history.intervals;
    
    const getLastInterval = (intervals) => 
      intervals.length > 0 ? intervals[intervals.length - 1].interval.toFixed(2) : 'N/A';

    const getLastThreeIntervals = (intervals) => {
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
          最新の呼気時間: {getLastInterval(minToMax)}秒
          {lastThreeExhale.length > 0 && `\n最近の記録: ${lastThreeExhale.join(', ')}秒`}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>呼吸パターン分析</Text>
      {renderIntervals()}
      {renderGraph(history.y, history.yRange, '#0066ff', 'Y軸生データ')}
      {renderGraph(history.yMA, history.yMARange, '#ff6600', 'Y軸移動平均', true)}
      {renderGraph(history.yDeviation, history.yDeviationRange, '#00cc00', 'Y軸偏差')}
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
  graphContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
});