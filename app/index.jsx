import { View, Text, Image } from 'react-native'
import React, { useEffect } from 'react'
import { Link, useNavigation } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'

const Index = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigation.navigate('(drawer)'); 
    }, 2500); 

    return () => clearTimeout(redirectTimer);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#121212' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={require('../assets/images/mfb.png')}
          style={{ width: 90, height: 90,   }}
        />
        <Text style={{ fontSize: 40, color: 'white', marginRight:10 }}>Mate for Bikers</Text>
      </View>
      <StatusBar style='light'/>
    </SafeAreaView>
  );
}

export default Index;
