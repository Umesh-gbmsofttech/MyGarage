import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import COLORS from '../../../theme/colors';

const ChatContactUs = () => {
    const [ menuVisible, setMenuVisible ] = useState(false);

    const toggleMenu = () => setMenuVisible(!menuVisible);
    const closeMenu = () => setMenuVisible(false);

    return (
        <>
            { menuVisible && (
                <TouchableWithoutFeedback onPress={ closeMenu }>
                    <View style={ styles.backdrop }>
                        <View style={ styles.menuContainer }>
                            <TouchableOpacity style={ styles.menuItem } onPress={ () => alert('Call') }>
                                <Ionicons name="call" size={ 24 } color="#fff" />
                                <Text style={ styles.menuText }>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={ styles.menuItem } onPress={ () => alert('Chat') }>
                                <Feather name="message-square" size={ 24 } color="#fff" />
                                <Text style={ styles.menuText }>Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={ styles.menuItem } onPress={ () => alert('DIY Guide') }>
                                <MaterialIcons name="menu-book" size={ 24 } color="#fff" />
                                <Text style={ styles.menuText }>DIY Guide</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            ) }

            <TouchableOpacity style={ styles.chatButton } onPress={ toggleMenu }>
                <Image
                    source={ require('../../../assets/images/support.png') }
                    style={ styles.icon }
                />
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    chatButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        zIndex: 9999,
    },
    icon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    menuContainer: {
        position: 'absolute',
        bottom: 90,
        right: 20,
        alignItems: 'flex-end',
        gap: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 25,
        elevation: 3,
    },
    menuText: {
        color: '#fff',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default ChatContactUs;
// import { Image, StyleSheet, TouchableOpacity } from 'react-native';

// const ChatContactUs = () => {
//     return (
//         <TouchableOpacity style={ styles.chatButton }>
//             <Image
//                 source={ require('../../../assets/images/support.png') }
//                 style={ styles.icon }
//             />
//         </TouchableOpacity>
//     );
// };

// const styles = StyleSheet.create({
//     chatButton: {
//         position: 'absolute',
//         bottom: 20,
//         right: 20,
//         backgroundColor: '#fff',
//         padding: 12,
//         borderRadius: 50,
//         elevation: 5,
//         shadowColor: '#000',
//         shadowOpacity: 0.3,
//         shadowRadius: 4,
//         shadowOffset: { width: 0, height: 2 },
//     },
//     icon: {
//         width: 28,
//         height: 28,
//         resizeMode: 'contain',
//     },
// });

// export default ChatContactUs;
