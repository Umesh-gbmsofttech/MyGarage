import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import COLORS from '../../theme/colors';

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

const DoItYourselfSection = () => {
  const router = useRouter();

  const handleSelect = (route) => {
    router.push({ pathname: '/vehicle-form', params: { service: route, mode: 'diy' } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Do It Yourself</Text>
      <View style={styles.servicesGrid}>
        {services.map((service) => (
          <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => handleSelect(service.route)}>
            <Image source={service.icon} style={styles.icon} />
            <Text style={styles.serviceName}>{service.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default DoItYourselfSection;

const styles = StyleSheet.create({
  container: { paddingHorizontal: 18, marginVertical: 10 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12, color: COLORS.text },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { width: 50, height: 50, marginBottom: 8, resizeMode: 'contain' },
  serviceName: { textAlign: 'center', fontSize: 12, fontWeight: '600', color: COLORS.muted },
});
