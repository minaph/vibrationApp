// useBreathingData.ts

import { useState, useEffect } from 'react';
import { Accelerometer } from 'expo-sensors';
import { initialState } from '@/hooks/metrics/initialState';
import { HistoryState } from '@/hooks/metrics/types';
import { CONSTANTS } from '@/hooks/metrics/constants';
import { calculateMA, calculateRange } from '@/hooks/metrics/utils';
import { detectPeaks, calculateIntervals, determineBreathingType } from '@/hooks/metrics/breathingAnalysis';

export function useBreathingData() {
  const [history, setHistory] = useState<HistoryState>(initialState);

  useEffect(() => {
    let subscription: { remove: any; };

    const enableAccelerometer = async () => {
      await Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(data => {
        setHistory((prev: HistoryState) => {
          const now = Date.now();

          const newY = [...prev.y.slice(1), data.y];
          const yMA = calculateMA(newY, CONSTANTS.MA_WINDOW);
          const newYMA = [...prev.yMA.slice(1), yMA];

          const deviation = data.y - yMA;
          const newYDeviation = [...prev.yDeviation.slice(1), deviation];

          const newTimestamp = [...prev.timestamp.slice(1), now];

          const peaks = detectPeaks(newYMA, newTimestamp);
          const intervals = calculateIntervals(peaks.maxima, peaks.minima);
          const breathing = determineBreathingType(intervals);

          return {
            ...prev,
            y: newY,
            yMA: newYMA,
            yDeviation: newYDeviation,
            timestamp: newTimestamp,
            peaks,
            intervals,
            breathingType: breathing.type,
            breathingDetail: breathing.detail,
            currentPeriod: breathing.period,
            yRange: calculateRange(newY),
            yMARange: calculateRange(newYMA),
            yDeviationRange: calculateRange(newYDeviation)
          };
        });
      });
    };

    enableAccelerometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return history;
}
