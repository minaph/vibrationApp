import { View } from 'react-native';
import SessionScreen from '@/components/SessionScreen';
import { router } from 'expo-router';

export default function Session() {
    return (
        <View style={{ flex: 1 }}>
            <SessionScreen onEnd={() => {router.push("/result")}} />
        </View>
    );
}