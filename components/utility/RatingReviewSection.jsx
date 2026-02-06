import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import api from '../../src/services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const SPACING = 16;

const RatingReviewSection = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await api.platformReviews();
      setReviews(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return undefined;
    let scrollValue = 0;
    const autoScroll = setInterval(() => {
      if (scrollViewRef.current) {
        scrollValue = (scrollValue + CARD_WIDTH + SPACING) % ((CARD_WIDTH + SPACING) * reviews.length);
        scrollViewRef.current.scrollTo({ x: scrollValue, animated: true });
      }
    }, 3500);
    return () => clearInterval(autoScroll);
  }, [reviews.length]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i += 1) {
      stars.push(
        <Icon key={i} name={i <= rating ? 'star' : 'star-o'} size={14} color="#fbc02d" style={{ marginRight: 2 }} />
      );
    }
    return <View style={styles.starRow}>{stars}</View>;
  };

  return (
    <View style={styles.reviewsSection}>
      <Text style={styles.title}>Customer Reviews</Text>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: SPACING }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {reviews.map((review) => (
          <View key={review.id} style={[styles.reviewCard, { width: CARD_WIDTH, marginRight: SPACING }]}>
            {renderStars(review.rating || 0)}
            <Text style={styles.comment}>{review.comment || 'No comment provided.'}</Text>
            <View style={styles.reviewerInfo}>
              <Image source={require('../../assets/images/profile.png')} style={styles.avatarSmall} />
              <Text style={styles.reviewerName}>{review.author?.firstName || 'User'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RatingReviewSection;

const styles = StyleSheet.create({
  reviewsSection: {
    marginTop: 10,
    paddingVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 15,
    marginBottom: 10,
    color: '#1F2A24',
  },
  reviewCard: {
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4E8E4',
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
