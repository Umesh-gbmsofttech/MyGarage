import { ScrollView, StyleSheet, Text } from 'react-native';

export default function RegularService() {
    return (
        <ScrollView contentContainerStyle={ styles.container }>
            <Text style={ styles.title }>Regular Services</Text>
            <Text style={ styles.step }>① Check the Owner’s Manual</Text>
            <Text style={ styles.desc }>Follow the manufacturer’s maintenance schedule.</Text>
            <Text style={ styles.step }>② Change Engine Oil</Text>
            <Text style={ styles.desc }>Replace engine oil and filter at recommended intervals.</Text>
            <Text style={ styles.step }>③ Inspect Air Filters</Text>
            <Text style={ styles.desc }>Clean or replace air filters to improve fuel efficiency.</Text>
            <Text style={ styles.step }>④ Check Fluid Levels</Text>
            <Text style={ styles.desc }>Top up brake fluid, coolant, transmission, and power steering fluid.</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    step: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    desc: { fontSize: 14, color: '#444', marginBottom: 8 },
});
