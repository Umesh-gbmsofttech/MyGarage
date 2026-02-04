import { StyleSheet, Text, View } from 'react-native';

const EngineCooling = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Engine Cooling Care</Text>
            <Text style={ styles.description }>
                Ensure your vehicle's engine cooling system is in optimal condition by checking coolant levels, radiator, and fan.
            </Text>
        </View>
    );
};

export default EngineCooling;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
