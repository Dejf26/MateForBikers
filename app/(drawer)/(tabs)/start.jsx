import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Polyline } from 'react-native-maps';

const windowHeight = Dimensions.get('window').height;

const VehicleTile = ({ vehicle }) => (
  <View style={styles.tileContainer}>
    <ImageBackground source={vehicle.image?.uri ? { uri: vehicle.image.uri } : require('../../../assets/images/bike.jpg')} style={styles.image}>
      <View style={[styles.skewedTextContainer, { backgroundColor: "#2D2F33" }]}></View>
    </ImageBackground>
    <View style={styles.textContainer}>
      <Text style={styles.tileText}>Wybrany pojazd</Text>
      <Text style={styles.subtitleText}>Marka</Text>
      <Text style={styles.descriptionText}>{vehicle.brand || '-'}</Text>
      <Text style={styles.subtitleText}>Model</Text>
      <Text style={styles.descriptionText}>{vehicle.model || '-'}</Text>
      <Text style={styles.subtitleText}>Rok produkcji</Text>
      <Text style={styles.descriptionText}>{vehicle.year || '-'}</Text>
    </View>
  </View>
);

const RouteTile = ({ route }) => {
  const mapRegion = route.coordinates?.length > 0 ? {
    latitude: route.coordinates[0].latitude,
    longitude: route.coordinates[0].longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : null;

  return (
    <View style={styles.tileContainer}>
      {mapRegion ? (
        <MapView style={styles.map} initialRegion={mapRegion} scrollEnabled={false} zoomEnabled={false}>
          <Polyline coordinates={route.coordinates} strokeWidth={4} strokeColor="blue" />
        </MapView>
      ) : (
        <ImageBackground source={require('../../../assets/images/route.jpg')} style={styles.map} />
      )}
      <View style={[styles.skewedTextMapContainer, { backgroundColor: '#2D2F33' }]}></View>

      <View style={styles.textContainer}>
        <Text style={styles.tileText}>Ostatnia trasa</Text>
        <Text style={styles.subtitleText}>Czas trwania</Text>
        <Text style={styles.descriptionText}>
          {route.duration ? `${Math.floor(route.duration / 3600)}h ${Math.floor((route.duration % 3600) / 60)}m` : '-'}
        </Text>
        <Text style={styles.subtitleText}>Maksymalna prędkość</Text>
        <Text style={styles.descriptionText}>{route.maxSpeed ? `${route.maxSpeed} km/h` : '-'}</Text>
        <Text style={styles.subtitleText}>Dystans</Text>
        <Text style={styles.descriptionText}>
          {route.distance !== undefined ? `${route.distance.toFixed(1)} km` : '-'}
        </Text>
      </View>
    </View>
  );
};

const translateCondition = (condition) => {
  switch (condition) {
    case 'clear sky': return 'Bezchmurnie';
    case 'overcast clouds': return 'Zachmurzenie';
    case 'few clouds': return 'Małe zachmurzenie';
    case 'scattered clouds': return 'Rozproszone chmury';
    case 'broken clouds': return 'Duże zachmurzenie';
    case 'shower rain': return 'Przelotne opady deszczu';
    case 'rain': return 'Deszcz';
    case 'light rain': return 'Lekki deszcz';
    case 'thunderstorm': return 'Burza';
    case 'snow': return 'Śnieg';
    case 'mist': return 'Mgła';
    default: return condition;
  }
};

const WeatherTile = ({ weather }) => (
  <View style={styles.tileContainer}>
    <View style={styles.conditionContainer}>
      {weather.icon && weather.temp !== undefined ? (
        <View style={styles.iconContainer}>
          <Image
            source={{ uri: `https://openweathermap.org/img/w/${weather.icon}.png` }}
            style={styles.weatherIcon}
          />
          <Text style={styles.tempText}>{`${weather.temp}°C`}</Text>
        </View>
      ) : (
        <View style={styles.iconContainer}>
          <Text style={styles.tempText}></Text>
        </View>
      )}
    </View>

    <View style={[styles.skewedTextMapContainer, { backgroundColor: '#2D2F33' }]}></View>

    <View style={styles.textContainer}>
      <Text style={styles.tileText}>Prognoza pogody</Text>
      <Text style={styles.subtitleText}>Miasto:</Text>
      <Text style={styles.descriptionText}>{weather.city || '-'}</Text>
      <Text style={styles.subtitleText}>Warunki:</Text>
      <Text style={styles.descriptionText}>{translateCondition(weather.conditions || '-')}</Text>
      <Text style={styles.subtitleText}>Szansa na opady:</Text>
      <Text style={styles.descriptionText}>{weather.rainChance !== undefined ? `${weather.rainChance}%` : '-'}</Text>
    </View>
  </View>
);

const Start = () => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [latestRoute, setLatestRoute] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);

  const loadSelectedVehicle = async () => {
    try {
      const storedVin = await AsyncStorage.getItem('selectedVehicle');
      const vehiclesData = await AsyncStorage.getItem('vehicles');
      const vehicles = vehiclesData ? JSON.parse(vehiclesData) : [];

      if (storedVin) {
        const foundVehicle = vehicles.find(vehicle => vehicle.vin === storedVin);
        setSelectedVehicle(foundVehicle || {});
      }
    } catch (error) {
      console.error("Error loading selected vehicle:", error);
    }
  };

  const fetchLatestRoute = async () => {
    try {
      const storedRoute = await AsyncStorage.getItem('latestRoute');
      setLatestRoute(storedRoute ? JSON.parse(storedRoute) : {});
    } catch (error) {
      console.error('Error fetching latest route:', error);
    }
  };
  
  const loadSelectedWeather = async () => {
    try {
      const storedWeather = await AsyncStorage.getItem('selectedWeather');
      setSelectedWeather(storedWeather ? JSON.parse(storedWeather) : {});
    } catch (error) {
      console.error('Error loading selected weather:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSelectedVehicle();
      fetchLatestRoute();
      loadSelectedWeather();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <VehicleTile vehicle={selectedVehicle || {}} />
      <WeatherTile weather={selectedWeather || {} } />
      <RouteTile route={latestRoute || {}} />
      <StatusBar style='light' />
    </SafeAreaView>
  );
};

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
  map: {
    width: 170,
    height: '100%', 
    borderRadius: 10,
    position: 'absolute',
    right: 0,
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
    marginLeft: 60
  },
  skewedTextContainer: {
    width: '115%',
    height: '150%',
    padding: 10,
    marginLeft: -180,
    transform: [{ translateY: 0 }, { rotate: '-75deg' }],
  },
  skewedTextMapContainer: {
    width: '133%',
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
    alignItems: 'stretch',
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
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2D2F33',
  },
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
    marginLeft: 70
  },
  weatherIcon: {
    width: 77,
    height: 77,
  },
  tempText: {
    fontSize: 25,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  conditionContainer: {
    backgroundColor: '#007bff',
    width: 225,
    height: '100%',
    position: 'absolute',
    right: 0,
  },
});

export default Start;