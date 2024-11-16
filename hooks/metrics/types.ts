// types.ts

export interface Range {
  min: number;
  max: number;
}

export interface Peak {
  value: number;
  timestamp: number;
  index: number;
}

export interface Interval {
  interval: number;
  startTime: number;
  endTime: number;
}

export interface Peaks {
  maxima: Peak[];
  minima: Peak[];
}

export interface Intervals {
  maxToMax: Interval[];
  maxToMin: Interval[];
  minToMax: Interval[];
}

export interface HistoryState {
  y: number[];
  yMA: number[];
  yDeviation: number[];
  peaks: Peaks;
  intervals: Intervals;
  timestamp: number[];
  breathingType: string;
  breathingDetail: string;
  currentPeriod: number;
  yRange: Range;
  yMARange: Range;
  yDeviationRange: Range;
}
