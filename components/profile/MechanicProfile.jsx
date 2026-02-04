import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, Layout, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export default function MechanicProfile() {
    const [ available, setAvailable ] = useState(true);
    const availabilityColor = useSharedValue(available ? 'green' : 'red');

    const handleToggle = () => {
        setAvailable((prev) => {
            const newValue = !prev;
            availabilityColor.value = newValue ? 'green' : 'red';
            return newValue;
        });
    };

    const animatedStatusStyle = useAnimatedStyle(() => ({
        color: availabilityColor.value,
        fontWeight: 'bold',
    }));

    return (
        <ScrollView style={ styles.container }>
            <View style={ styles.header }>
                <Image source={ require('../../assets/images/MyGarage.png') } style={ styles.profileImg } />
                <Text style={ styles.name }>Mechanic-1</Text>

                <View style={ styles.statusRow }>
                    <Animated.Text style={ [ styles.status, animatedStatusStyle ] }>
                        { available ? 'Available' : 'Unavailable' }
                    </Animated.Text>
                    <Switch onValueChange={ handleToggle } value={ available } />
                </View>

                <Text style={ styles.rating }>Ratings: 4.8/5 (200 reviews)</Text>
            </View>

            <View style={ styles.dashboard }>
                <View style={ styles.row }>
                    <FontAwesome name="money" size={ 24 } color="green" />
                    <Text style={ styles.text }>₹ 10.1k earned</Text>
                </View>
                <View style={ styles.row }>
                    <MaterialIcons name="people" size={ 24 } color="black" />
                    <Text style={ styles.text }>14 customers served</Text>
                </View>
                <View style={ styles.row }>
                    <MaterialIcons name="calendar-today" size={ 24 } color="#555" />
                    <Text style={ styles.text }>S M T W T F S</Text>
                </View>
            </View>

            <View style={ styles.contactBox }>
                <Text style={ styles.subTitle }>Contact</Text>
                <Text style={ styles.contactText }>Phone: +91 9876543210</Text>
                <Text style={ styles.contactText }>Email: mechanic1@mygarage.com</Text>
                <Text style={ styles.contactText }>Working Hours: 9AM - 6PM</Text>
            </View>

            <Text style={ styles.sectionTitle }>Recent Services</Text>
            <View style={ styles.serviceBox }>
                { [ 'TATA Safari', 'TATA Punch', 'Hyundai i20' ].map((vehicle, index) => (
                    <Animated.View key={ index } entering={ FadeInUp.delay(index * 100) } layout={ Layout.springify() }>
                        <ServiceCard vehicle={ vehicle } service="Regular Maintenance and Health Check" />
                    </Animated.View>
                )) }
            </View>
        </ScrollView>
    );
}

const ServiceCard = ({ vehicle, service }) => (
    <TouchableOpacity activeOpacity={ 0.8 }>
        <View style={ styles.card }>
            <Image source={ require('../../assets/images/MyGarage.png') } style={ styles.cardImg } />
            <View>
                <Text style={ styles.cardTitle }>{ vehicle }</Text>
                <Text style={ styles.cardDesc }>{ service }</Text>
            </View>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { backgroundColor: '#fff' },
    header: {
        alignItems: 'center',
        backgroundColor: '#d0ecfb',
        paddingBottom: 30,
        paddingTop: 40,
        borderBottomLeftRadius: 200,
        borderBottomRightRadius: 200,
    },
    profileImg: { width: 90, height: 90, borderRadius: 45 },
    name: { fontSize: 20, fontWeight: 'bold', marginTop: 10, color: '#222' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    status: { fontSize: 16, marginRight: 10 },
    rating: { color: '#333', marginTop: 5 },
    dashboard: {
        backgroundColor: '#cce6f4',
        borderRadius: 12,
        margin: 20,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
    text: { marginLeft: 10, fontSize: 16, color: '#333' },
    contactBox: {
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 15,
        backgroundColor: '#e6f5ff',
        borderRadius: 10,
    },
    contactText: { fontSize: 14, marginTop: 4, color: '#555' },
    subTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
    },
    serviceBox: { paddingHorizontal: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginVertical: 6,
        borderRadius: 10,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardImg: { width: 50, height: 50, marginRight: 12, borderRadius: 8 },
    cardTitle: { fontWeight: 'bold', fontSize: 15, color: '#222' },
    cardDesc: { fontSize: 13, color: '#555' },
});
