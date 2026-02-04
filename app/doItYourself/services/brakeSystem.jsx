import { StyleSheet, Text, View } from 'react-native';

const BrakeSystem = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Brake System Check</Text>
            <Text style={ styles.description }>
                Inspect brake pads, discs, and fluid regularly to ensure safe stopping.
            </Text>
        </View>
    );
};

export default BrakeSystem;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
