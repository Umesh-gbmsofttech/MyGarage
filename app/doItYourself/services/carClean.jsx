import { StyleSheet, Text, View } from 'react-native';

const CarClean = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Keep the Car Clean</Text>
            <Text style={ styles.description }>
                Regular washing and interior cleaning help protect your vehicle and maintain hygiene.
            </Text>
        </View>
    );
};

export default CarClean;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
