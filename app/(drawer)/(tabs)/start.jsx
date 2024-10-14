import React from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const windowHeight = Dimensions.get('window').height;

const Tile = ({ title, subtitle, description, subtitle2, description2, subtitle3, description3, color, image }) => {
  return (
    <View style={styles.tileContainer}>
      <ImageBackground source={image} style={styles.image}>
        <View style={[styles.skewedTextContainer, { backgroundColor: color }]}></View>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={styles.tileText}>{title}</Text>
        {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        {description && <Text style={styles.descriptionText}>{description}</Text>}
        {subtitle2 && <Text style={styles.subtitleText}>{subtitle2}</Text>}
        {description2 && <Text style={styles.descriptionText}>{description2}</Text>}
        {subtitle3 && <Text style={styles.subtitleText}>{subtitle3}</Text>}
        {description3 && <Text style={styles.descriptionText}>{description3}</Text>}
      </View>
    </View>
  );
}

const Start = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tile 
        title="Wybrany pojazd" 
        subtitle="Marka" 
        description="Marka" 
        subtitle2="Model" 
        description2="Model" 
        subtitle3="Rok produkcji" 
        description3="Rok produkcji" 
        color="#2D2F33" 
        image={require('../../../assets/images/bike.jpg')} 
      />
      <Tile 
        title="Prognoza pogody" 
        subtitle="Temperatura" 
        description="Temperatura" 
        subtitle2="Warunki" 
        description2="Warunki" 
        subtitle3="Szansa na opady" 
        description3="Szansa na opady" 
        color="#2D2F33" 
        image={require('../../../assets/images/route.jpg')} 
      />
      <Tile 
        title="Ostatnia trasa" 
        subtitle="Czas trwania" 
        description="Czas trwania" 
        subtitle2="Maksymalna prędkość" 
        description2="Maksymalna prędkość" 
        subtitle3="Dystans" 
        description3="Dystans" 
        color="#2D2F33" 
        image={require('../../../assets/images/route.jpg')} 
      />
      <StatusBar style='light' />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50
  },
  tileContainer: {
    height: windowHeight / 3 - 70,
    width: '97%',
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 20,
  },
  image: {
   width: '100%',
  justifyContent:'flex-end',
  marginLeft: 60
  },
  skewedTextContainer: {
    width: '115%',
    height: '150%',
    padding: 10,
    marginLeft: -180,
    transform: [{ translateY: 0 }, { rotate: '-75deg' }],
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 12,
    right: 12,
    justifyContent: 'space-evenly',
    alignItems: 'strech',
  },
  tileText: {
    color: 'white',
    fontSize: 20,
  },
  subtitleText: {
    color: '#6e6e6e',
    fontSize: 13,
    marginBottom: -5
  },
  descriptionText: {
    color: 'white',
    fontSize: 15,
    marginTop: -5
  }
});

export default Start;
