import { StyleSheet, Text, View } from 'react-native';

const Lights = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Lights and Electrical</Text>
            <Text style={ styles.description }>
                Regularly test all lights, indicators, and electrical functions to ensure visibility and safety.
            </Text>
        </View>
    );
};

export default Lights;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
