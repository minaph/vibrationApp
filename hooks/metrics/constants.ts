// constants.ts

import { Dimensions } from 'react-native';

export const CONSTANTS = {
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
