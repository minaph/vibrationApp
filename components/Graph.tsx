// Graph.tsx

import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Line, Circle, Rect } from 'react-native-svg';
import { CONSTANTS } from '@/hooks/metrics/constants';
import { HistoryState, Range } from '@/hooks/metrics/types';

interface GraphProps {
  data: number[];
  range: Range;
  color: string;
  label: string;
  showPeaks?: boolean;
  history: HistoryState;
}

const renderBreathingPhases = (history: HistoryState) => {
  const { maxToMin, minToMax } = history.intervals;
  const phases: React.JSX.Element[] = [];

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
};

const Graph: React.FC<GraphProps> = ({ data, range, color, label, showPeaks = false, history }) => {
  const points = data.map((value, index) => {
    const x = (index * (CONSTANTS.WINDOW_WIDTH - 40)) / (CONSTANTS.MAX_DATA_POINTS - 1);
    const normalizedValue = (value - range.min) / (range.max - range.min);
    const y = CONSTANTS.GRAPH_HEIGHT - (normalizedValue * CONSTANTS.GRAPH_HEIGHT);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        {label}: {data[data.length - 1].toFixed(3)}
      </Text>
      <Svg height={CONSTANTS.GRAPH_HEIGHT} width={CONSTANTS.WINDOW_WIDTH - 40}>
        {showPeaks && renderBreathingPhases(history)}

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
};

export default Graph;
