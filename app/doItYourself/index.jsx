import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const services = [
    { id: '1', name: 'Regular Services', icon: require('../../assets/images/diy/regularService.png'), route: 'regular' },
    { id: '2', name: 'Engine Cooling Care', icon: require('../../assets/images/diy/engineAndCooling.png'), route: 'engineCooling' },
    { id: '3', name: 'Tyres & Wheel Care', icon: require('../../assets/images/diy/tyres.png'), route: 'tyres' },
    { id: '4', name: 'Batteries', icon: require('../../assets/images/diy/batteries.png'), route: 'batteries' },
    { id: '5', name: 'Brake System Check', icon: require('../../assets/images/diy/brakeSystem.png'), route: 'brakeSystem' },
    { id: '6', name: 'Keep the Car Clean', icon: require('../../assets/images/diy/carClean.png'), route: 'carClean' },
    { id: '7', name: 'Emergency Preparedness', icon: require('../../assets/images/diy/emergencyPrepared.png'), route: 'emergency' },
    { id: '8', name: 'Lights and Electrical', icon: require('../../assets/images/diy/lightSystem.png'), route: 'lights' },
];

const DoItYourself = () => {
    const router = useRouter();

    const handleSelect = (route) => {
        router.push({ pathname: '/doItYourself/vehicleForm', params: { service: route } });
    };

    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Do It Yourself</Text>
            <View style={ styles.servicesGrid }>
                { services.map(service => (
                    <View key={ service.id } style={ styles.serviceCard }>
                        <TouchableOpacity onPress={ () => handleSelect(service.route) }>
                            <Image source={ service.icon } style={ styles.icon } />
                            <Text style={ styles.serviceName }>{ service.name }</Text>
                        </TouchableOpacity>
                    </View>
                )) }
            </View>
        </View>
    );
};

export default DoItYourself;

const styles = StyleSheet.create({
    container: { paddingHorizontal: 10, marginVertical: 10 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serviceCard: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    icon: { width: 50, height: 50, marginBottom: 8, resizeMode: 'contain', alignSelf: 'center', mixBlendMode: 'multiply' },
    serviceName: { textAlign: 'center', fontSize: 12, fontWeight: '500' },
});
