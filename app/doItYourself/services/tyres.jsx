import { StyleSheet, Text, View } from 'react-native';

const Tyres = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Tyres & Wheel Care</Text>
            <Text style={ styles.description }>
                Inspect tyre tread, air pressure, and wheel alignment regularly for optimal performance and safety.
            </Text>
        </View>
    );
};

export default Tyres;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
