import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ContactUs = () => {
    return (
        <View style={ styles.container }>
            <Text style={ styles.title }>Contact Us</Text>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('tel:9226224019') }>
                <Icon name="phone" size={ 24 } color="#007bff" />
                <Text style={ styles.text }>9226224019</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('https://www.gbmsofttech.com') }>
                <Icon name="globe" size={ 24 } color="#28a745" />
                <Text style={ styles.text }>www.gbmsofttech.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('mailto:mygarage@gmail.com') }>
                <Icon name="envelope" size={ 24 } color="#dc3545" />
                <Text style={ styles.text }>mygarage@gmail.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('https://www.instagram.com') }>
                <Icon name="instagram" size={ 24 } color="#e1306c" />
                <Text style={ styles.text }>Instagram</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('https://www.facebook.com') }>
                <Icon name="facebook" size={ 24 } color="#1877F2" />
                <Text style={ styles.text }>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={ styles.row } onPress={ () => Linking.openURL('https://www.linkedin.com') }>
                <Icon name="linkedin" size={ 24 } color="#0077b5" />
                <Text style={ styles.text }>LinkedIn</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ContactUs;

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'flex-start',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    text: {
        fontSize: 18,
        marginLeft: 10,
        color: '#333',
    },
});
