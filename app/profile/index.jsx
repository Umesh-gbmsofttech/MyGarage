import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Button, ScrollView, View } from 'react-native';
import MechanicProfile from '../../components/profile/MechanicProfile';

export default function ProfileScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        // Optional: if you want to reset or change later
        return () => {
            navigation.setOptions({ headerShown: true });
        };
    }, [ navigation ]);

    return (
        <ScrollView>
            <StatusBar hidden={ true } />
            {/* <View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
                <Text>Profile Main Screen</Text>
            </View> */}

            <MechanicProfile />

            <View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
                <Button title="Go to Details" onPress={ () => router.push('/profile/details') } />
            </View>
        </ScrollView>
    );
}
