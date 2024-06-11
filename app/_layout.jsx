
import { View, Text } from 'react-native'
import React from 'react'
import { Drawer } from 'expo-router/drawer'
import { Stack } from 'expo-router'

const RootLayout = () => {
  return (

  <Stack screenOptions={{navigationBarColor: '#121212'}}>
   
    <Stack.Screen name="index" options={{headerShown: false}} />
    <Stack.Screen name ="(drawer)" options={{headerShown: false, headerStyle:{backgroundColor:"#121212"}}} />
  </Stack>
  )
}

export default RootLayout
