import Constants from 'expo-constants';

export const isRunningInProduction = Constants.executionEnvironment === Constants.ExecutionEnvironment?.Standalone;