import { Entypo, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function VehicleOwnerProfile() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <ScrollView style={ styles.container }>
            <Animated.View
                style={ [
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [ { translateY: slideAnim } ],
                    },
                ] }
            >
                <Image
                    source={ require('../../assets/images/MyGarage.png') }
                    style={ styles.profileImg }
                />
                <Text style={ styles.name }>Rahul Rathod (Owner)</Text>
            </Animated.View>

            <Animated.View style={ { opacity: fadeAnim } }>
                <View style={ styles.details }>
                    <InfoRow icon="user" text="Name: Rahul Rathod" />
                    <InfoRow icon="envelope" text="Email ID: rahul@gmail.com" />
                    <InfoRow icon="phone" text="Phone No: 1123542453" />
                    <InfoRow icon="location-pin" iconSet="Entypo" text="Location: Pune" />
                    <InfoRow
                        icon="car-repair"
                        iconSet="MaterialIcons"
                        text="Service: Engine Service"
                    />
                </View>

                <Text style={ styles.historyTitle }>Service History</Text>
                <View style={ styles.historyCard }>
                    <Text>Date: 12 Oct 2022</Text>
                    <Text>Location: Pune</Text>
                    <Text>Service: Engine Service</Text>
                    <Text style={ styles.timeAgo }>2 months ago</Text>
                </View>
            </Animated.View>
        </ScrollView>
    );
}

const InfoRow = ({ icon, text, iconSet = 'FontAwesome' }) => {
    const Icon =
        iconSet === 'Entypo'
            ? Entypo
            : iconSet === 'MaterialIcons'
                ? MaterialIcons
                : FontAwesome;

    return (
        <View style={ styles.row }>
            <View style={ styles.iconWrapper }>
                <Icon name={ icon } size={ 20 } color="#0a3d62" />
            </View>
            <Text style={ styles.rowText }>{ text }</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    header: {
        alignItems: 'center',
        backgroundColor: '#d0ecfb',
        paddingBottom: 25,
        borderBottomLeftRadius: 200,
        borderBottomRightRadius: 200,
        paddingTop: 40,
    },
    profileImg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginTop: 10,
        borderWidth: 2,
        borderColor: '#0a3d62',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#0a3d62',
    },
    details: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 1, height: 2 },
    },
    iconWrapper: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    rowText: {
        fontSize: 16,
        color: '#333',
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingLeft: 20,
        marginTop: 10,
        color: '#0a3d62',
    },
    historyCard: {
        backgroundColor: '#f0f0f0',
        margin: 20,
        borderRadius: 10,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
    timeAgo: {
        fontSize: 12,
        color: 'gray',
        marginTop: 5,
    },
});
