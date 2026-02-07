import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Dimensions,
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import MenuPanel from './MenuPanel';
import COLORS from '../../theme/colors';

export default function NavSearchBar({ isMenuOpen, setIsMenuOpen }) {
    const navigation = useNavigation();
    const [ isSearching, setIsSearching ] = useState(false);
    const [ searchQuery, setSearchQuery ] = useState('');

    const handleSearchIconPress = () => setIsSearching(true);
    const handleCancelSearch = () => {
        setIsSearching(false);
        setSearchQuery('');
        Keyboard.dismiss();
    };

    const handleNotificationPress = () => alert('Notification Pressed');

    return (
        <TouchableWithoutFeedback onPress={ Keyboard.dismiss }>
            <View style={ { flex: 1 } }>
                <View style={ styles.navBar }>
                    <TouchableOpacity onPress={ setIsMenuOpen }>
                        <Feather name="menu" size={ 24 } color="#000" />
                    </TouchableOpacity>

                    { isSearching ? (
                        <TextInput
                            style={ styles.input }
                            placeholder="Search here..."
                            value={ searchQuery }
                            onChangeText={ setSearchQuery }
                            autoFocus
                            placeholderTextColor={ COLORS.placeholder }
                        />
                    ) : (
                        <Text style={ styles.title }>MYGARAGE</Text>
                    ) }

                    { isSearching ? (
                        <TouchableOpacity onPress={ handleCancelSearch }>
                            <Feather name="x" size={ 24 } color="#000" />
                        </TouchableOpacity>
                    ) : (
                        <View style={ styles.iconGroup }>
                            <TouchableOpacity onPress={ handleNotificationPress }>
                                <Ionicons name="notifications-outline" size={ 24 } color="#333" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={ handleSearchIconPress }>
                                <Feather name="search" size={ 24 } color="#000" />
                            </TouchableOpacity>
                        </View>
                    ) }
                </View>

                {/* Overlay MenuPanel */ }
                { isMenuOpen && (
                    <>
                        <View style={ styles.menuOverlayAbsolute }>
                            <TouchableWithoutFeedback onPress={ () => setIsMenuOpen(false) }>
                                <View style={ styles.backdrop } />
                            </TouchableWithoutFeedback>
                            <MenuPanel onClose={ () => setIsMenuOpen(false) } />
                        </View>
                    </>
                ) }

            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 10,
        marginTop: 30,
    },
    title: {
        fontSize: 20,
        color: '#E63946',
        fontWeight: 'bold',
    },
    input: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    iconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    menuOverlayAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        zIndex: 9999, // ensure it's on top
        flexDirection: 'row',
    },

    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },

});
