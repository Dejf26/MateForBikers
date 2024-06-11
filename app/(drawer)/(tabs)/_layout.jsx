import { View, Text, Platform, Dimensions, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabBarHeight = 65;

const TabsLayout = () => {
  const insets = useSafeAreaInsets();
  const bottomNavBarHeight = insets.bottom;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#007DC9',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarStyle: {
            backgroundColor: '#2D2F33',
            borderTopWidth: 10,
            borderBottomWidth: 10,
            borderTopColor: '#2D2F33',
            borderBottomColor: '#2D2F33',
            height: tabBarHeight + bottomNavBarHeight,
          },
        }}
      >
        <Tabs.Screen
          name="start"
          options={{
            title: 'Start',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={'home'} size={25} color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="vehicles"
          options={{
            title: 'Pojazdy',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon
                name={'motorcycle'}
                size={25}
                color={color}
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="costs"
          options={{
            title: 'Koszty',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={'dollar-sign'} size={25} color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="routesm"
          options={{
            title: 'Trasy',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={'map-pin'} size={25} color={color} focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="weather"
          options={{
            title: 'Pogoda',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={'cloud-sun'} size={25} color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default TabsLayout;
