// initialState.ts

import { CONSTANTS } from './constants';
import { HistoryState } from './types';

export const initialState: HistoryState = {
  y: Array<number>(CONSTANTS.MAX_DATA_POINTS).fill(0),
  yMA: Array<number>(CONSTANTS.MAX_DATA_POINTS).fill(0),
  yDeviation: Array<number>(CONSTANTS.MAX_DATA_POINTS).fill(0),
  peaks: { maxima: [], minima: [] },
  intervals: { maxToMax: [], maxToMin: [], minToMax: [] },
  timestamp: Array<number>(CONSTANTS.MAX_DATA_POINTS).fill(Date.now()),
  breathingType: 'unknown',
  breathingDetail: '',
  currentPeriod: 0,
  yRange: { min: -1, max: 1 },
  yMARange: { min: -1, max: 1 },
  yDeviationRange: { min: -1, max: 1 }
};
