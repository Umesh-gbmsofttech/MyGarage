import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DoItYourselfSection from '../diy/DoItYourselfSection';
import OurMechanics from '../mechanic/OurMechanics';
import TopMechanics from '../mechanic/TopMechanics';
import RatingReviewSection from '../utility/RatingReviewSection';
import api from '../../src/services/api';
import BannerCarousel from './BannerCarousel';

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

  useEffect(() => {
    if (params.section === 'diy' && diyRef.current && scrollRef.current) {
      diyRef.current.measureLayout(scrollRef.current.getScrollResponder(), (x, y) => {
        scrollRef.current.scrollTo({ y, animated: true });
      });
    }
  }, [ params.section ]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScrollView
      ref={ scrollRef }
      contentContainerStyle={ styles.container }
      refreshControl={ <RefreshControl refreshing={ refreshing } onRefresh={ onRefresh } /> }
    >
      <BannerCarousel banners={ banners } />
      <View style={ styles.hero }>
        <Text style={ styles.heroTitle }>Find trusted mechanics fast</Text>
        <Text style={ styles.heroSubtitle }>Book certified help or solve it yourself.</Text>
        <TouchableOpacity style={ styles.heroButton } onPress={ () => router.push('/search') }>
          <Text style={ styles.heroButtonText }>View All Mechanics</Text>
        </TouchableOpacity>
      </View>

      <TopMechanics mechanics={ topMechanics } />
      <OurMechanics mechanics={ randomMechanics } />

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
    backgroundColor: '#0B3B2E',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#DDE8E1',
    marginTop: 6,
  },
  heroButton: {
    marginTop: 14,
    backgroundColor: '#FDFCF7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    color: '#0B3B2E',
    fontWeight: '700',
  },
});

export default Home;
