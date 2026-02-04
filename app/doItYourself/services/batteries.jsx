import { StyleSheet, Text, View } from 'react-native';

const Batteries = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Battery Maintenance</Text>
            <Text style={ styles.description }>
                Check battery charge level, terminals for corrosion, and secure connections.
            </Text>
        </View>
    );
};

export default Batteries;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
