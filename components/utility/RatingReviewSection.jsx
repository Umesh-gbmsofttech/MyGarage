import { Image, ScrollView, StyleSheet, Text, View, Animated, Dimensions } from 'react-native';
import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = 16;

const reviews = [
    { id: '1', name: 'John Doe', rating: 5, comment: 'Very professional and affordable! Highly recommended!', avatar: require('../../assets/images/profile.png') },
    { id: '2', name: 'Mark Smith', rating: 4, comment: 'The service was good, but the mechanic arrived 30 minutes late.', avatar: require('../../assets/images/profile.png') },
    { id: '3', name: 'Alice Lee', rating: 5, comment: 'Excellent experience and quick response!', avatar: require('../../assets/images/profile.png') },
    { id: '4', name: 'Tom White', rating: 4, comment: 'Mechanic was skilled and courteous.', avatar: require('../../assets/images/profile.png') },
    { id: '5', name: 'Sam Green', rating: 5, comment: 'Super helpful and quick fix.', avatar: require('../../assets/images/profile.png') },
    { id: '6', name: 'Lisa Brown', rating: 4, comment: 'Great service overall.', avatar: require('../../assets/images/profile.png') },
];

export class RatingReviewSection extends Component {
    scrollX = new Animated.Value(0);
    scrollViewRef = React.createRef();

    componentDidMount() {
        let scrollValue = 0;
        this.autoScroll = setInterval(() => {
            if (this.scrollViewRef.current) {
                scrollValue = (scrollValue + width) % (width * reviews.length);
                this.scrollViewRef.current.scrollTo({ x: scrollValue, animated: true });
            }
        }, 3000);
    }

    componentWillUnmount() {
        clearInterval(this.autoScroll);
    }

    renderStars = (rating) => {
        let stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Icon
                    key={ i }
                    name={ i <= rating ? 'star' : 'star-o' }
                    size={ 14 }
                    color="#fbc02d"
                    style={ { marginRight: 2 } }
                />
            );
        }
        return <View style={ styles.starRow }>{ stars }</View>;
    };

    render() {
        return (
            <View style={ styles.reviewsSection }>
                <Text style={ styles.title }>Customer Reviews</Text>
                <ScrollView
                    ref={ this.scrollViewRef }
                    horizontal
                    showsHorizontalScrollIndicator={ false }
                    snapToInterval={ CARD_WIDTH + SPACING } // ensures snapping
                    decelerationRate="fast"
                    contentContainerStyle={ { paddingHorizontal: SPACING } }
                    onScroll={ Animated.event(
                        [ { nativeEvent: { contentOffset: { x: this.scrollX } } } ],
                        { useNativeDriver: false }
                    ) }
                    scrollEventThrottle={ 16 }
                >
                    { reviews.map((review) => (
                        <View key={ review.id } style={ [ styles.reviewCard, { width: CARD_WIDTH, marginRight: SPACING } ] }>
                            { this.renderStars(review.rating) }
                            <Text style={ styles.comment }>{ review.comment }</Text>
                            <View style={ styles.reviewerInfo }>
                                <Image source={ review.avatar } style={ styles.avatarSmall } />
                                <Text style={ styles.reviewerName }>{ review.name }</Text>
                            </View>
                        </View>
                    )) }
                </ScrollView>

            </View>
        );
    }
}

export default RatingReviewSection;

const styles = StyleSheet.create({
    reviewsSection: {
        marginTop: 10,
        paddingVertical: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        marginBottom: 10,
    },
    reviewCard: {
        borderRadius: 12,
        padding: 15,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    starRow: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    comment: {
        fontSize: 14,
        marginBottom: 10,
        color: '#333',
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    reviewerName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#555',
    },
    avatarSmall: {
        width: 26,
        height: 26,
        borderRadius: 13,
        marginRight: 8,
    },
});
