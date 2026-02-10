import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import COLORS from '../../theme/colors';

const menuItems = [
  { icon: 'calendar-outline', label: 'Book Now', route: '/book-now' },
  { icon: 'clipboard-outline', label: 'My Bookings', route: '/my-bookings' },
  { icon: 'person-outline', label: 'My Account', route: '/profile' },
  { icon: 'search-outline', label: 'Find Mechanics', route: '/search' },
  { icon: 'document-text-outline', label: 'Terms & Conditions', route: '/terms' },
  { icon: 'shield-checkmark-outline', label: 'Policy', route: '/policy' },
  { icon: 'star-outline', label: 'Feedback', route: '/feedback' },
];

const SidebarMenu = ({ onClose }) => {
  const router = useRouter();

  const handlePress = (route) => {
    onClose();
    router.push(route);
  };

  return (
    <View style={ styles.panel }>
      <LinearGradient colors={ [ COLORS.primarySoft, COLORS.primary ] } style={ styles.brand }>
        {/* <Image source={ require('../../assets/images/MyGarage.png') } style={ styles.logo } /> */ }
        <Text style={ styles.brandText }>MyGarage</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={ styles.menu }>
        { menuItems.map((item) => (
          <TouchableOpacity key={ item.label } style={ styles.menuItem } onPress={ () => handlePress(item.route) }>
            <Ionicons name={ item.icon } size={ 20 } color={COLORS.primary} />
            <Text style={ styles.menuText }>{ item.label }</Text>
          </TouchableOpacity>
        )) }
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: '78%',
    height: '100%',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  brand: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
  },
  logo: {
    width: 120,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  menu: {
    padding: 18,
    gap: 14,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default SidebarMenu;
