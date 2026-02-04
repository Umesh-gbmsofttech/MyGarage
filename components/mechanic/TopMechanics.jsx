import React, { Component } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

const topMechanics = [
    { id: '1', name: 'Mechanic-1', rating: 4.3, reviews: 2005, image: require('../../assets/images/profile.png') },
    { id: '2', name: 'Mechanic-2', rating: 4.3, reviews: 2005, image: require('../../assets/images/profile.png') },
    { id: '3', name: 'Mechanic-3', rating: 4.3, reviews: 2005, image: require('../../assets/images/profile.png') },
];

export class TopMechanics extends Component {
    render() {
        return (
            <View style={ styles.container }>
                <Text style={ styles.heading }>Top Mechanics</Text>
                <FlatList
                    horizontal
                    data={ topMechanics }
                    renderItem={ ({ item }) => (
                        <View style={ styles.mechanicCard }>
                            <Image source={ item.image } style={ styles.avatar } />
                            <Text style={ styles.mechanicName }>{ item.name }</Text>
                            <Text style={ styles.specialization }>Specialized in: na</Text>
                            <Text style={ styles.rating }>{ item.rating } ⭐ ({ item.reviews })</Text>
                        </View>
                    ) }
                    keyExtractor={ (item) => item.id }
                />
            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        marginTop: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    mechanicCard: {
        alignItems: 'center',
        marginHorizontal: 10,

        //    width: '30%', // 3 cards per row
        alignItems: 'center',
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
    avatar: {
        width: 60,
        height: 60,
        aspectRatio: 1,
        resizeMode: 'contain',
        borderRadius: 30,
        marginBottom: 5,
    },
    mechanicName: {
        fontWeight: 'bold',
    },
    specialization: {
        fontSize: 12,
        color: '#888',
    },
    rating: {
        fontSize: 12,
        color: '#888',
    }

});

export default TopMechanics