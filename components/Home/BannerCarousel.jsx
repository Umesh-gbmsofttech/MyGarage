import React, { useEffect, useRef } from 'react';
import { FlatList, Image, StyleSheet, View } from 'react-native';
import API_BASE from '../../api';

const BannerCarousel = ({ banners = [] }) => {
  const listRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!banners.length) return undefined;
    const interval = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % banners.length;
      listRef.current?.scrollToIndex({ index: indexRef.current, animated: true });
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length]);

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: `${API_BASE.replace('/api', '')}${item.imageUrl}` }}
        style={styles.image}
      />
    </View>
  );

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={banners}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E8E4',
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width: 320,
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default BannerCarousel;
