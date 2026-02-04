import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View } from 'react-native';
import MapScreen from '../components/maps/MapScreen';
import RatingReview from '../components/utility/RatingReview';
import RequestStatus from '../components/utility/RequestStatus';


export default function BookingsScreen() {
    return (
        <ScrollView>
            <StatusBar hidden={ true } />
            <View style={ { flex: 1, justifyContent: 'center', alignItems: 'center' } }>
                <Text>Bookings Screen</Text>
            </View>
            <RequestStatus />
            <RatingReview />
            <MapScreen />
        </ScrollView>
    );
}
