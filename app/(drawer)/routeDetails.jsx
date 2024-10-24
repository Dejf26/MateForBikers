import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const RouteDetails = () => {
  const [routeData, setRouteData] = useState(null);
  const [initialRegion, setInitialRegion] = useState(null);
  const route = useRoute();
  const routeId = route.params?.routeId;

  const loadRouteData = async () => {
    try {
      const storedRoutes = await AsyncStorage.getItem('routes');
      if (storedRoutes) {
        const routes = JSON.parse(storedRoutes);
        const selectedRoute = routes.find((r) => r.id === routeId);
        if (selectedRoute) {
          setRouteData(selectedRoute);
          if (selectedRoute.coordinates?.length > 0) {
            const { latitude, longitude } = selectedRoute.coordinates[0];
            setInitialRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          } else {
          }
        }
      }
    } catch (error) {
      console.error('Błąd przy odczytywaniu danych z AsyncStorage:', error);
    }
  };

  useEffect(() => {
    if (routeId) {
      loadRouteData();
    }
  }, [routeId]);

  if (!routeData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nie znaleziono danych dla tej trasy.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
        >
          {routeData.coordinates?.length > 0 ? (
            <Polyline
              coordinates={routeData.coordinates}
              strokeWidth={4}
              strokeColor="blue"
            />
          ) : (
            <Text style={styles.errorText}>Brak dostępnych współrzędnych do narysowania trasy</Text>
          )}
        </MapView>
      ) : (
        <View style={styles.map}>
          <Text style={styles.errorText}>Brak danych dla mapy</Text>
        </View>
      )}

      <View style={styles.detailsContainer}>
  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Data rozpoczęcia:</Text>
    <Text style={styles.descriptionText}>{routeData.startDate}</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Początek trasy:</Text>
    <Text style={styles.descriptionText}>{routeData.startLocation}</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Dystans:</Text>
    <Text style={styles.descriptionText}>{routeData.distance?.toFixed(2)} km</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Czas trwania:</Text>
    <Text style={styles.descriptionText}>{Math.floor(routeData.duration / 3600)}g {Math.floor((routeData.duration % 3600) / 60)}m {routeData.duration % 60}s</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Średnia prędkość:</Text>
    <Text style={styles.descriptionText}>{routeData.avgSpeed} km/h</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Maksymalna prędkość:</Text>
    <Text style={styles.descriptionText}>{routeData.maxSpeed} km/h</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Maksymalny kąt w prawo:</Text>
    <Text style={styles.descriptionText}>{routeData.maxLeanRight}°</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Maksymalny kąt w lewo:</Text>
    <Text style={styles.descriptionText}>{Math.abs(routeData.maxLeanLeft)}°</Text>
  </View>
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  map: {
    height: 450,
    marginBottom: 20,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
    errorText: {
    fontSize: 18,
    color: 'fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitleText: {
    color: '#6e6e6e',
    fontSize: 13,
    marginBottom: 0
  },
  descriptionText: {
    color: 'white',
    fontSize: 15,
    marginTop: 0
  },
  detailsContainer: {
    marginTop: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%', 
    marginBottom: 10, 
    alignItems: 'center', 
  },
});

export default RouteDetails;
