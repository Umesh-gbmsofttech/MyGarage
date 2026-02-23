import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DoItYourselfSection from '../diy/DoItYourselfSection';
import OurMechanics from '../mechanic/OurMechanics';
import TopMechanics from '../mechanic/TopMechanics';
import RatingReviewSection from '../utility/RatingReviewSection';
import api from '../../src/services/api';
import BannerCarousel from './BannerCarousel';
import COLORS from '../../theme/colors';
import { Skeleton, SkeletonRow } from '../utility/Skeleton';

const Home = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollRef = useRef(null);
  const diyRef = useRef(null);
  const [ topMechanics, setTopMechanics ] = useState([]);
  const [ randomMechanics, setRandomMechanics ] = useState([]);
  const [ banners, setBanners ] = useState([]);
  const [ refreshing, setRefreshing ] = useState(false);

  const load = useCallback(async () => {
    const top = await api.topRatedMechanics(5);
    const random = await api.randomMechanics(10);
    const bannerList = await api.adminBanners();
    setTopMechanics(top);
    setRandomMechanics(random);
    setBanners(bannerList);
  }, []);

  useEffect(() => {
    load();
  }, [ load ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useEffect(() => {
    if (params.section === 'diy' && diyRef.current && scrollRef.current) {
      diyRef.current.measureLayout(scrollRef.current.getScrollResponder(), (x, y) => {
        scrollRef.current.scrollTo({ y, animated: true });
      });
    }
  }, [ params.section ]);

  return (
    <ScrollView
      ref={ scrollRef }
      contentContainerStyle={ styles.container }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {banners.length > 0 ? (
        <BannerCarousel banners={ banners } />
      ) : (
        <View style={styles.bannerSkeleton}>
          <Skeleton height={160} width="100%" />
        </View>
      )}
      <View style={ styles.hero }>
        <Text style={ styles.heroTitle }>Find trusted mechanics fast</Text>
        <Text style={ styles.heroSubtitle }>Book certified help or solve it yourself.</Text>
        <TouchableOpacity style={ styles.heroButton } onPress={ () => router.push('/search') }>
          <Text style={ styles.heroButtonText }>View All Mechanics</Text>
        </TouchableOpacity>
      </View>

      {topMechanics.length > 0 ? (
        <TopMechanics mechanics={ topMechanics } />
      ) : (
        <View style={styles.sectionSkeleton}>
          <Skeleton height={18} width="55%" />
          <SkeletonRow lines={3} lineHeight={12} />
        </View>
      )}
      {randomMechanics.length > 0 ? (
        <OurMechanics mechanics={ randomMechanics } />
      ) : (
        <View style={styles.sectionSkeleton}>
          <Skeleton height={18} width="45%" />
          <SkeletonRow lines={3} lineHeight={12} />
        </View>
      )}

      <View ref={ diyRef }>
        <DoItYourselfSection />
      </View>

      <RatingReviewSection />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  hero: {
    margin: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#E6EEF6',
    marginTop: 6,
  },
  heroButton: {
    marginTop: 14,
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  bannerSkeleton: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  sectionSkeleton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
  },
});

export default Home;
