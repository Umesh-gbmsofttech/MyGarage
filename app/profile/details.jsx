import { useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView } from 'react-native';
import MechanicProfile from '../../components/profile/MechanicProfile';
import VehicleOwnerProfile from '../../components/profile/VehicleOwnerProfile';

export default function DetailsScreen() {

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
        // <View >
        <ScrollView>
            <MechanicProfile />
            <VehicleOwnerProfile />
        </ScrollView>
        // </View>
    );
}
