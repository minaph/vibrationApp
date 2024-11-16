// app/index.tsx
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import HomeScreen from '@/components/HomeScreen';

export default function Home() {
    const router = useRouter();

    return (
        <View style={{ flex: 1 }}>
            <HomeScreen
                onStartSession={() => router.push('/session')}
                onOpenSettings={() => router.push('/settings')}
                onOpenGuide={() => router.push('/guide')}
            />
        </View>
    );
}