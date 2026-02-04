// app/_layout.jsx
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={ {
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { height: 60, paddingBottom: 5 },
      } }
    >
      <Tabs.Screen
        name="index"
        options={ {
          title: 'Home',
          tabBarIcon: ({ color }) => (
            // <MaterialIcons name="home" size={ 24 } color={ color } />
            <Icon name={ 'home-outline' } size={ 24 } color={ color } />
          ),
        } }
      />
      <Tabs.Screen
        name="bookings"
        options={ {
          title: 'Bookings',
          tabBarIcon: ({ color }) => (
            <Icon name={ 'calendar-check-outline' } size={ 24 } color={ color } />
          ),
        } }
      />
      <Tabs.Screen
        name="profile"
        options={ {
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Icon name={ 'account-circle-outline' } size={ 24 } color={ color } />
          ),
        } }
      />

      {/* 👇 Hide the (routes) directory from the tab bar */ }
      <Tabs.Screen name="doItYourself" options={ { href: null } } />
    </Tabs>
  );
}