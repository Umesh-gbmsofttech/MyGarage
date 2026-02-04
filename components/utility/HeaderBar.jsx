import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons';

const HeaderBar = () => {

    const handleProfilePress = () => { alert('Profile Pressed') };
    const handleNotificationPress = () => { alert('Notification Pressed') };
    const handleSettingsPress = () => { alert('Settings Pressed') };

    return (
        <View style={ styles.topBar }>
            <TouchableOpacity onPress={ handleProfilePress }><Ionicons name="person-circle-outline" size={ 24 } color="#333" /></TouchableOpacity>
            <View style={ styles.rightIcons }>
                <TouchableOpacity onPress={ handleNotificationPress }><Ionicons name="notifications-outline" size={ 24 } color="#333" /></TouchableOpacity>
                <TouchableOpacity onPress={ handleSettingsPress }><Ionicons name="settings-outline" size={ 24 } color="#333" /></TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 5,
    },
    rightIcons: {
        flexDirection: 'row',
        gap: 15,
    }

});


export default HeaderBar