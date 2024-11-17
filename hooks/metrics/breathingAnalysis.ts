// breathingAnalysis.ts

import { CONSTANTS } from './constants';
import { Peak, Peaks, Interval, Intervals, StabilityStatus, BreathingType } from './types';
import { calculateStandardDeviation } from './utils';

export function detectPeaks(data: number[], timestamps: number[]): Peaks {
  const maxima: Peak[] = [];
  const minima: Peak[] = [];
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
}

export function calculateIntervals(maxima: Peak[], minima: Peak[]): Intervals {
  const intervals: Intervals = {
    maxToMax: [],
    maxToMin: [],
    minToMax: []
  };

  const allPeaks = [...maxima, ...minima].sort((a, b) => a.timestamp - b.timestamp);

  // 極大値間の間隔
  for (let i = 1; i < maxima.length; i++) {
    intervals.maxToMax.push({
      interval: (maxima[i].timestamp - maxima[i - 1].timestamp) / 1000,
      startTime: maxima[i - 1].timestamp,
      endTime: maxima[i].timestamp
    });
  }

  // 連続する極値間の間隔を計算
  for (let i = 0; i < allPeaks.length - 1; i++) {
    const current = allPeaks[i];
    const next = allPeaks[i + 1];
    const interval = (next.timestamp - current.timestamp) / 1000;

    const currentIsMax = maxima.some(m => m.timestamp === current.timestamp);
    const nextIsMin = minima.some(m => m.timestamp === next.timestamp);
    const currentIsMin = minima.some(m => m.timestamp === current.timestamp);
    const nextIsMax = maxima.some(m => m.timestamp === next.timestamp);

    if (currentIsMax && nextIsMin) {
      intervals.maxToMin.push({
        interval,
        startTime: current.timestamp,
        endTime: next.timestamp
      });
    } else if (currentIsMin && nextIsMax) {
      intervals.minToMax.push({
        interval,
        startTime: current.timestamp,
        endTime: next.timestamp
      });
    }
  }

  return intervals;
}

export function determineBreathingType(intervals: Intervals): {
  type: BreathingType;
  period: number;
  detail: string;
} {
  const { maxToMin, minToMax } = intervals;
  const { BREATHING_THRESHOLDS } = CONSTANTS;

  if (maxToMin.length < BREATHING_THRESHOLDS.RECENT_BREATHS ||
    minToMax.length < BREATHING_THRESHOLDS.RECENT_BREATHS) {
    return { type: '計算中...', period: 0, detail: '' };
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
  const inhaleStdDev = calculateStandardDeviation(recentInhales, avgInhale);
  const exhaleStdDev = calculateStandardDeviation(recentExhales, avgExhale);
  const isStable = inhaleStdDev < BREATHING_THRESHOLDS.STABILITY_THRESHOLD &&
    exhaleStdDev < BREATHING_THRESHOLDS.STABILITY_THRESHOLD;
  const stabilityStatus: StabilityStatus = isStable ? '安定' : '不安定';

  // 呼吸タイプの判定
  let type: `通常呼吸 (${StabilityStatus})` | `深呼吸 (${StabilityStatus})`;
  if (avgInhale >= BREATHING_THRESHOLDS.DEEP_INHALE_MIN &&
    avgExhale >= BREATHING_THRESHOLDS.DEEP_EXHALE_MIN) {
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
