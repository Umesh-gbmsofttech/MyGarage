import { Tabs } from 'expo-router';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={ {
        headerShown: false,
        tabBarStyle: { display: 'none' },
      } }
    >
      <Tabs.Screen
        name="index"
        options={ {
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home-outline" size={ 22 } color={ color } />,
        } }
      />
      <Tabs.Screen
        name="bookings"
        options={ {
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Icon name="calendar-check-outline" size={ 22 } color={ color } />,
        } }
      />
      <Tabs.Screen
        name="profile"
        options={ {
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="account-circle-outline" size={ 22 } color={ color } />,
        } }
      />
    </Tabs>
  );
}
