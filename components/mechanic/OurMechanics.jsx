import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

const mechanicImages = [
    require('../../assets/images/profile.png'),
    require('../../assets/images/profile.png'),
    require('../../assets/images/profile.png'),
    require('../../assets/images/profile.png'),
];

const OurMechanics = () => {
    return (
        <View style={ styles.container }>
            {/* <Text style={ styles.heading }>Our Mechanics</Text> */ }
            <View style={ styles.iconGrid }>
                { mechanicImages.map((img, index) => (
                    <View key={ index } style={ styles.item }>
                        <Image source={ img } style={ styles.avatarIcon } />
                        <Text style={ styles.name }>Mechanic { index + 1 }</Text>
                    </View>
                )) }
            </View>
            <TouchableOpacity onPress={ () => alert('View All Mechanics') }><Text style={ styles.viewAllText }>View All Mechanics</Text></TouchableOpacity>
        </View>
    );
};

export default OurMechanics;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 15,
        backgroundColor: '#f5f5f5',
        marginTop: 10,
        borderRadius: 10,
        padding: 10,
        // marginHorizontal: 10,
    },
    viewAllText: {
        fontSize: 10,
        fontStyle: 'italic',
        marginLeft: 10,
        marginTop: 10,
        left: '70%',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    item: {
        alignItems: 'center',
        marginBottom: 15,

        //   alignItems: 'center',
        marginBottom: 2,
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        elevation: 2, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        // backgroundColor: '#ddd',
    },
    name: {
        marginTop: 5,
        fontSize: 12,
        fontWeight: '500',
    },
});
