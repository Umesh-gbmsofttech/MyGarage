import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Footer = () => {
    return (
        <View style={ styles.container }>
            <TouchableOpacity>
                <Text style={ styles.toTop }>to top</Text>
            </TouchableOpacity>

            <View style={ styles.iconRow }>
                <Icon name="facebook" size={ 24 } color="#fff" style={ styles.icon } />
                <Icon name="twitter" size={ 24 } color="#fff" style={ styles.icon } />
                <Icon name="instagram" size={ 24 } color="#fff" style={ styles.icon } />
                <Icon name="youtube-play" size={ 24 } color="#fff" style={ styles.icon } />
            </View>

            <View style={ styles.linksRow }>
                <Text style={ styles.link }>Imprint / Privacy</Text>
                <Text style={ styles.link }>Terms & Conditions</Text>
                <Text style={ styles.link }>Feedback</Text>
            </View>

            <Text style={ styles.standardLink }>Standard Website</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#483AA0',
        padding: 12,
        alignItems: 'center',
        // marginBottom: 15,
    },
    toTop: {
        color: '#fff',
        fontSize: 14,
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    iconRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    icon: {
        marginHorizontal: 10,
    },
    linksRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 8,
    },
    link: {
        color: '#fff',
        fontSize: 12,
        marginHorizontal: 6,
        borderRightWidth: 1,
        borderRightColor: '#fff',
        paddingRight: 6,
    },
    standardLink: {
        color: '#fff',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
});

export default Footer;
