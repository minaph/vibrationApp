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
  breathingType: BreathingType;
  breathingDetail: string;
  currentPeriod: number;
  yRange: Range;
  yMARange: Range;
  yDeviationRange: Range;
}


export type StabilityStatus = "安定" | "不安定"
export type BreathingDeepness = "深" | "通常"
export type BreathingType = `${BreathingDeepness}呼吸 (${StabilityStatus})` | '計算中...'
export interface Breathing {
  type: BreathingType;
  detail: string;
  period: number;
}