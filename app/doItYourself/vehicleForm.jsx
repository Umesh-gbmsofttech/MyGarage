import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function VehicleForm() {
    const router = useRouter();
    const { service } = useLocalSearchParams();

    const [ vehicleType, setVehicleType ] = useState('');
    const [ model, setModel ] = useState('');
    const [ fuelType, setFuelType ] = useState('');

    const handleSubmit = () => {
        if (!vehicleType || !model || !fuelType) {
            alert('Please fill out all fields');
            return;
        }
        router.replace(`/doItYourself/services/${service}`);
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.heading }>Vehicle Information</Text>
            <TextInput placeholder="Vehicle Type (Car/Bike/Truck)" style={ styles.input } value={ vehicleType } onChangeText={ setVehicleType } />
            <TextInput placeholder="Model" style={ styles.input } value={ model } onChangeText={ setModel } />
            <TextInput placeholder="Fuel Type (Petrol/Diesel/CNG/Electric)" style={ styles.input } value={ fuelType } onChangeText={ setFuelType } />
            <Button title="Continue" onPress={ handleSubmit } />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12,
    },
});
