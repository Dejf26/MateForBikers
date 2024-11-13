import { View, Text } from 'react-native'
import React from 'react'

const About = () => {
  return (
    <View className="flex-1 items-center justify-center bg-[#121212]">
    <Text className="text-3xl text-white">Mate for Bikers</Text>
    <Text className="text-1xl text-white">Aplikacja stworzona na potrzeby P1 i P2</Text>
    <Text className="text-1xl text-white">Wyższa Szkoła Ekonomii i Informatyki w Krakowie</Text>
    <Text className="text-1xl text-white">Autor: Dawid Migdał</Text>

    </View>
    
  )
}

export default About