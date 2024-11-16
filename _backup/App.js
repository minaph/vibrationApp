import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import Svg, { Polyline, Line, Circle, Rect } from 'react-native-svg';

// 定数定義
const CONSTANTS = {
  WINDOW_WIDTH: Dimensions.get('window').width,
  GRAPH_HEIGHT: 80,
  MAX_DATA_POINTS: 350,    // 15秒分のデータ (10Hz)
  MA_WINDOW: 50,           // 5秒の移動平均 (10Hz)
  PEAK_THRESHOLD: 0.1,     // ピーク検出の閾値
  PEAK_PATIENCE: 27,       // ピーク検出の待機時間
  BREATHING_THRESHOLDS: {
    DEEP_INHALE_MIN: 3,    // 深呼吸の最小吸気時間
    DEEP_EXHALE_MAX: 4,    // 深呼吸の最大呼気時間
    STABILITY_THRESHOLD: 0.4, // 安定性判定の閾値
    RECENT_BREATHS: 3      // 判定に使用する直近の呼吸回数
  }
};

// 初期状態
const initialState = {
  y: Array(CONSTANTS.MAX_DATA_POINTS).fill(0),
  yMA: Array(CONSTANTS.MAX_DATA_POINTS).fill(0),
  yDeviation: Array(CONSTANTS.MAX_DATA_POINTS).fill(0),
  peaks: { maxima: [], minima: [] },
  intervals: { maxToMax: [], maxToMin: [], minToMax: [] },
  timestamp: Array(CONSTANTS.MAX_DATA_POINTS).fill(Date.now()),
  breathingType: 'unknown',
  breathingDetail: '',
  currentPeriod: 0,
  yRange: { min: -1, max: 1 },
  yMARange: { min: -1, max: 1 },
  yDeviationRange: { min: -1, max: 1 }
};

// ユーティリティ関数
const utils = {
  calculateMA: (data, window) => {
    const recentData = data.slice(-window);
    return recentData.reduce((sum, val) => sum + val, 0) / window;
  },

  calculateRange: (data) => {
    const validData = data.filter(x => !isNaN(x) && x !== null);
    if (validData.length === 0) return { min: -1, max: 1 };
    const min = Math.min(...validData);
    const max = Math.max(...validData);
    const margin = (max - min) * 0.1;
    return { min: min - margin, max: max + margin };
  },

  calculateStandardDeviation: (values, mean) => {
    return Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
  }
};

// 呼吸解析関連の関数
const breathingAnalysis = {
  detectPeaks: (data, timestamps) => {
    const maxima = [];
    const minima = [];
    let lastMaxIndex = -CONSTANTS.PEAK_PATIENCE;
    let lastMinIndex = -CONSTANTS.PEAK_PATIENCE;

    for (let i = CONSTANTS.PEAK_PATIENCE; i < data.length - CONSTANTS.PEAK_PATIENCE; i++) {
      const windowStart = i - CONSTANTS.PEAK_PATIENCE;
      const windowEnd = i + CONSTANTS.PEAK_PATIENCE;
      const windowData = data.slice(windowStart, windowEnd + 1);
      const currentValue = data[i];

      if (currentValue === Math.max(...windowData) &&
          i - lastMaxIndex >= CONSTANTS.PEAK_PATIENCE &&
          Math.abs(currentValue) > CONSTANTS.PEAK_THRESHOLD) {
        maxima.push({ value: currentValue, timestamp: timestamps[i], index: i });
        lastMaxIndex = i;
      }

      if (currentValue === Math.min(...windowData) &&
          i - lastMinIndex >= CONSTANTS.PEAK_PATIENCE &&
          Math.abs(currentValue) > CONSTANTS.PEAK_THRESHOLD) {
        minima.push({ value: currentValue, timestamp: timestamps[i], index: i });
        lastMinIndex = i;
      }
    }

    return { maxima, minima };
  },

  calculateIntervals: (maxima, minima) => {
    const intervals = {
      maxToMax: [],
      maxToMin: [],
      minToMax: []
    };

    const allPeaks = [...maxima, ...minima].sort((a, b) => a.timestamp - b.timestamp);

    // 極大値間の間隔
    for (let i = 1; i < maxima.length; i++) {
      intervals.maxToMax.push({
        interval: (maxima[i].timestamp - maxima[i-1].timestamp) / 1000,
        startTime: maxima[i-1].timestamp,
        endTime: maxima[i].timestamp
      });
    }

    // 連続する極値間の間隔を計算
    for (let i = 0; i < allPeaks.length - 1; i++) {
      const current = allPeaks[i];
      const next = allPeaks[i + 1];
      const interval = (next.timestamp - current.timestamp) / 1000;

      if (maxima.some(m => m.timestamp === current.timestamp) &&
          minima.some(m => m.timestamp === next.timestamp)) {
        intervals.maxToMin.push({
          interval,
          startTime: current.timestamp,
          endTime: next.timestamp
        });
      } else if (minima.some(m => m.timestamp === current.timestamp) &&
                 maxima.some(m => m.timestamp === next.timestamp)) {
        intervals.minToMax.push({
          interval,
          startTime: current.timestamp,
          endTime: next.timestamp
        });
      }
    }

    return intervals;
  },

  determineBreathingType: (intervals) => {
    const { maxToMin, minToMax } = intervals;
    const { BREATHING_THRESHOLDS } = CONSTANTS;
    
    if (maxToMin.length < BREATHING_THRESHOLDS.RECENT_BREATHS || 
        minToMax.length < BREATHING_THRESHOLDS.RECENT_BREATHS) {
      return { type: 'calculating...', period: 0, detail: '' };
    }

    // 直近の呼吸データを取得
    const recentInhales = maxToMin.slice(-BREATHING_THRESHOLDS.RECENT_BREATHS)
      .map(interval => interval.interval);
    const recentExhales = minToMax.slice(-BREATHING_THRESHOLDS.RECENT_BREATHS)
      .map(interval => interval.interval);

    // 平均値計算
    const avgInhale = recentInhales.reduce((sum, val) => sum + val, 0) / 
      BREATHING_THRESHOLDS.RECENT_BREATHS;
    const avgExhale = recentExhales.reduce((sum, val) => sum + val, 0) / 
      BREATHING_THRESHOLDS.RECENT_BREATHS;

    // 安定性の評価
    const inhaleStdDev = utils.calculateStandardDeviation(recentInhales, avgInhale);
    const exhaleStdDev = utils.calculateStandardDeviation(recentExhales, avgExhale);
    const isStable = inhaleStdDev < BREATHING_THRESHOLDS.STABILITY_THRESHOLD && 
      exhaleStdDev < BREATHING_THRESHOLDS.STABILITY_THRESHOLD;
    const stabilityStatus = isStable ? '安定' : '不安定';

    // 呼吸タイプの判定
    let type;
    if (avgInhale >= BREATHING_THRESHOLDS.DEEP_INHALE_MIN && 
        avgExhale <= BREATHING_THRESHOLDS.DEEP_EXHALE_MAX) {
      type = `深呼吸 (${stabilityStatus})`;
    } else {
      type = `通常呼吸 (${stabilityStatus})`;
    }

    return {
      type,
      period: avgInhale + avgExhale,
      detail: `平均吸気: ${avgInhale.toFixed(1)}秒, 平均呼気: ${avgExhale.toFixed(1)}秒`
    };
  }
};

// グラフ描画関連の関数
const graphRendering = {
  renderBreathingPhases: (history) => {
    const { maxToMin, minToMax } = history.intervals;
    const phases = [];

    // 吸気フェーズの描画（青色）
    maxToMin.forEach(interval => {
      const startIndex = history.timestamp.findIndex(t => t === interval.startTime);
      const endIndex = history.timestamp.findIndex(t => t === interval.endTime);
      if (startIndex >= 0 && endIndex >= 0) {
        const x = (startIndex * (CONSTANTS.WINDOW_WIDTH - 40)) / CONSTANTS.MAX_DATA_POINTS;
        const width = ((endIndex - startIndex) * (CONSTANTS.WINDOW_WIDTH - 40)) / 
          CONSTANTS.MAX_DATA_POINTS;
        phases.push(
          <Rect
            key={`inhale-${interval.startTime}`}
            x={x}
            y={0}
            width={width}
            height={CONSTANTS.GRAPH_HEIGHT}
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
        const x = (startIndex * (CONSTANTS.WINDOW_WIDTH - 40)) / CONSTANTS.MAX_DATA_POINTS;
        const width = ((endIndex - startIndex) * (CONSTANTS.WINDOW_WIDTH - 40)) / 
          CONSTANTS.MAX_DATA_POINTS;
        phases.push(
          <Rect
            key={`exhale-${interval.startTime}`}
            x={x}
            y={0}
            width={width}
            height={CONSTANTS.GRAPH_HEIGHT}
            fill="rgba(255, 0, 0, 0.1)"
          />
        );
      }
    });

    return phases;
  },

  renderGraph: (data, range, color, label, showPeaks = false, history) => {
    const points = data.map((value, index) => {
      const x = (index * (CONSTANTS.WINDOW_WIDTH - 40)) / (CONSTANTS.MAX_DATA_POINTS - 1);
      const normalizedValue = (value - range.min) / (range.max - range.min);
      const y = CONSTANTS.GRAPH_HEIGHT - (normalizedValue * CONSTANTS.GRAPH_HEIGHT);
      return `${x},${y}`;
    }).join(' ');

    return (
      <View style={styles.graphContainer}>
        <Text style={styles.label}>
          {label}: {data[data.length - 1].toFixed(3)}
        </Text>
        <Svg height={CONSTANTS.GRAPH_HEIGHT} width={CONSTANTS.WINDOW_WIDTH - 40}>
          {showPeaks && graphRendering.renderBreathingPhases(history)}
          
          <Line
            x1="0"
            y1={CONSTANTS.GRAPH_HEIGHT / 2}
            x2={CONSTANTS.WINDOW_WIDTH - 40}
            y2={CONSTANTS.GRAPH_HEIGHT / 2}
            stroke="#cccccc"
            strokeWidth="1"
          />

          <Polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />

          {showPeaks && history.peaks.maxima.map((peak, index) => {
            const x = (peak.index * (CONSTANTS.WINDOW_WIDTH - 40)) / 
              (CONSTANTS.MAX_DATA_POINTS - 1);
            const normalizedValue = (data[peak.index] - range.min) / (range.max - range.min);
            const y = CONSTANTS.GRAPH_HEIGHT - (normalizedValue * CONSTANTS.GRAPH_HEIGHT);
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
            const x = (peak.index * (CONSTANTS.WINDOW_WIDTH - 40)) / 
              (CONSTANTS.MAX_DATA_POINTS - 1);
            const normalizedValue = (data[peak.index] - range.min) / (range.max - range.min);
            const y = CONSTANTS.GRAPH_HEIGHT - (normalizedValue * CONSTANTS.GRAPH_HEIGHT);
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
  }
};

// メインコンポーネント
export default function App() {
  const [history, setHistory] = useState(initialState);

  const renderIntervals = () => {
    const { maxToMin, minToMax } = history.intervals;
    
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
          直近の吸気時間: {lastThreeInhale.join(', ')}秒
        </Text>
        <Text style={styles.intervalText}>
          直近の呼気時間: {lastThreeExhale.join(', ')}秒
        </Text>
      </View>
    );
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

          const yMA = utils.calculateMA(newHistory.y, CONSTANTS.MA_WINDOW);
          newHistory.yMA.push(yMA);

          const deviation = data.y - yMA;
          newHistory.yDeviation.push(deviation);

          const peaks = breathingAnalysis.detectPeaks(newHistory.yMA, newHistory.timestamp);
          const intervals = breathingAnalysis.calculateIntervals(peaks.maxima, peaks.minima);
          const breathing = breathingAnalysis.determineBreathingType(intervals);

          return {
            ...newHistory,
            peaks,
            intervals,
            breathingType: breathing.type,
            breathingDetail: breathing.detail,
            currentPeriod: breathing.period,
            yRange: utils.calculateRange(newHistory.y),
            yMARange: utils.calculateRange(newHistory.yMA),
            yDeviationRange: utils.calculateRange(newHistory.yDeviation)
          };
        });
      });
    };

    enableAccelerometer();
    return () => subscription && subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>呼吸パターン分析</Text>
      {renderIntervals()}
      {graphRendering.renderGraph(history.y, history.yRange, '#0066ff', 'Y軸生データ', false, history)}
      {graphRendering.renderGraph(history.yMA, history.yMARange, '#ff6600', 'Y軸移動平均', true, history)}
      {graphRendering.renderGraph(history.yDeviation, history.yDeviationRange, '#00cc00', 'Y軸偏差', false, history)}
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