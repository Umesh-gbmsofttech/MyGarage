import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MenuPanel({ onClose }) {
    const router = useRouter();

    const menuItems = [
        { icon: 'calendar', text: 'Book Now' },
        { icon: 'clipboard', text: 'My Bookings' },
        { icon: 'person', text: 'My Account' },
        { icon: 'build', text: 'Become A Mechanic' },
        { icon: 'help-circle', text: 'Help & Info' },
        { icon: 'star', text: 'Rate App' },
        { icon: 'share-social', text: 'Share App' },
        { icon: 'call', text: 'Contact Us' },
    ];

    const handlePress = (text) => {
        if (text === 'My Bookings') {
            router.push('/bookings');
        } else {
            Alert.alert(`${text} button is clicked`);
        }
    };

    return (
        <View style={ styles.overlay }>
            <ScrollView contentContainerStyle={ styles.panel }>
                <TouchableOpacity onPress={ onClose } style={ styles.closeIcon }>
                    <Feather name="x" size={ 24 } color="#000" />
                </TouchableOpacity>

                <View style={ styles.headerImageContainer }>
                    <LinearGradient
                        colors={ [ '#ffffff', '#a0d8f1' ] }
                        start={ { x: 0, y: 1 } }
                        end={ { x: 0, y: 0 } }
                        style={ styles.gradientShape }
                    >
                        <Image
                            source={ require('../../assets/images/MyGarage.png') }
                            style={ styles.headerImage }
                        />
                    </LinearGradient>
                </View>

                { menuItems.map(({ icon, text }) => (
                    <TouchableOpacity key={ text } style={ styles.menuItem } onPress={ () => handlePress(text) }>
                        <Ionicons name={ icon } size={ 22 } color="#000" style={ { marginRight: 12 } } />
                        <Text style={ styles.menuText }>{ text }</Text>
                    </TouchableOpacity>
                )) }
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '85%',
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 100,
        elevation: 10,
        paddingTop: 40,
    },
    panel: {
        paddingHorizontal: 20,
    },
    closeIcon: {
        alignSelf: 'flex-end',
        marginBottom: 10,
    },
    headerImageContainer: {
        overflow: 'hidden',
        height: 150,
        marginRight: -20,
        marginLeft: -20,
    },
    gradientShape: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // transform: [ { rotate: '-5deg' } ],
    },
    headerImage: {
        width: 160,
        height: 90,
        resizeMode: 'contain',
        // transform: [ { rotate: '5deg' } ],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    menuText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
});
