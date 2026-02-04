import { StyleSheet, Text, View } from 'react-native';

const Emergency = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Emergency Preparedness</Text>
            <Text style={ styles.description }>
                Always carry essential tools, first-aid kit, torch, jumper cables, and spare tyre.
            </Text>
        </View>
    );
};

export default Emergency;

const styles = StyleSheet.create({
    container: { padding: 16 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    description: { fontSize: 14 },
});
