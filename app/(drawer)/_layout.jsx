import { View, Text, Image, Alert, Button,} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { router, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CustomDrawerContent = (props) => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      setUser(userData ? JSON.parse(userData) : null);
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    Alert.alert('Wylogowano');
    router.push('/login'); 
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: "#121212" }}>
      <DrawerItem
        icon={({ color, size }) => (
          <Icon style={{ marginLeft: 3 }} name={"home"} size={25} color={pathname == '/start' ? '#007DC9' : '#fff'} />
        )}
        label={'Start'}
        labelStyle={[{ marginLeft: -8, color: pathname == '/start' ? '#007DC9' : '#fff' }]}
        onPress={() => { router.push('/(drawer)/(tabs)/start') }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Icon style={{ marginLeft: 7 }} name={"sd-card"} size={25} color={pathname == '/export' ? '#007DC9' : '#fff'} />
        )}
        label={'Eksport danych'}
        labelStyle={[{ marginLeft: 0, color: pathname == '/export' ? '#007DC9' : '#fff' }]}
        onPress={() => { router.push('/(drawer)/export') }}
      />
      <DrawerItem
        icon={({ color, size }) => (
          <Icon style={{ marginLeft: 12 }} name={"info"} size={25} color={pathname == '/about' ? '#007DC9' : '#fff'} />
        )}
        label={'O aplikacji'}
        labelStyle={[{ marginLeft: 5, color: pathname == '/about' ? '#007DC9' : '#fff' }]}
        onPress={() => { router.push('/(drawer)/about') }}
      />

      <View style={{ marginTop: 20, padding: 10 }}>
        {user ? (
          <>
            <Text style={{ color: '#fff', marginBottom: 10 }}>Zalogowano jako: {user.email}</Text>
            <Button title="Wyloguj się" color="#007bff" onPress={handleLogout}  />
          </>
        ) : (
          <Button
            title="Zaloguj się"
            color="#007bff"
            onPress={() => {
              router.push('/login');

            }}
          />
        )}
      </View>
    </DrawerContentScrollView>
  );
}

const ToggleDrawer = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Icon
        name="bars"
        onPress={() => navigation.toggleDrawer()}
        color="#fff"
        size={25}
        style={{ marginLeft: 15 }}
      />
    </View>
  )
}

const Layout = () => {
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name='(tabs)' options={{
        headerShown: true, 
        headerTintColor: "white",
        title: (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Image
              source={require('../../assets/images/mfb.png')}
              style={{ width: 43, height: 43, marginLeft: -13 }}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Mate for Bikers</Text>
          </View>
        ),
        headerStyle: { backgroundColor: "#121212" },
        headerLeft: () => (<ToggleDrawer />),
        headerRight: () => (
          <Icon
            name="plus"
            onPress={() => alert('Tutaj będzie przekierowanie!')}
            color="#fff"
            size={25}
            style={{ marginRight: 15 }}
          />
        ),
      }} />
      <Drawer.Screen name='login' options={{
        headerShown: true,
        headerTintColor: "white",
        title: (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Image
              source={require('../../assets/images/mfb.png')}
              style={{ width: 43, height: 43, marginLeft: -13 }}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Mate for Bikers</Text>
          </View>
        ),
        headerStyle: { backgroundColor: "#121212" },
        headerLeft: () => (<ToggleDrawer />),
      }} />
      <Drawer.Screen name='register' options={{
        headerShown: true,
        headerTintColor: "white",
        title: (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Image
              source={require('../../assets/images/mfb.png')}
              style={{ width: 43, height: 43, marginLeft: -13 }}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Mate for Bikers</Text>
          </View>
        ),
        headerStyle: { backgroundColor: "#121212" },
        headerLeft: () => (<ToggleDrawer />),
      }} />
      <Drawer.Screen name='export' options={{
        headerShown: true,
        headerTintColor: "white",
        title: (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Image
              source={require('../../assets/images/mfb.png')}
              style={{ width: 43, height: 43, marginLeft: -13 }}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Mate for Bikers</Text>
          </View>
        ),
        headerStyle: { backgroundColor: "#121212" },
        headerLeft: () => (<ToggleDrawer />),
      }} />
      <Drawer.Screen name='about' options={{
        headerShown: true,
        headerTintColor: "white",
        title: (
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
            <Image
              source={require('../../assets/images/mfb.png')}
              style={{ width: 43, height: 43, marginLeft: -13 }}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Mate for Bikers</Text>
          </View>
        ),
        headerStyle: { backgroundColor: "#121212" },
        headerLeft: () => (<ToggleDrawer />),
      }} />
    </Drawer>
  )
}


export default Layout;
