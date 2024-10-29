import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Location from 'expo-location';
import MapView, { Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const NewRouteScreen = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [maxSpeed, setMaxSpeed] = useState(0); 
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [leanAngle, setLeanAngle] = useState(0);
  const [maxLeanLeft, setMaxLeanLeft] = useState(0);
  const [maxLeanRight, setMaxLeanRight] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [mapPosition] = useState(new Animated.Value(width));
  const [gpsSignalStrength, setGpsSignalStrength] = useState('Unknown');
  const [currentLocation, setCurrentLocation] = useState(null);
  
  const mapRef = useRef(null); 

  let angle = 0;
  let bias = 0;
  let rate = 0;
  const Q_angle = 0.001;
  const Q_bias = 0.003;
  const R_measure = 0.03;
  let P = [[0, 0], [0, 0]];
  let K = [0, 0];
  let y = 0;
  let S = 0;
  const updateInterval = 50;

  useEffect(() => {
    startLocationTracking();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    } else if (!isRecording && duration !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);


  const handleStartStop = async () => {
    if (isRecording) {
      const startLocationName = await getCityFromLocation(currentLocation);
      const newRoute = {
        id: Date.now(),
        startDate: new Date().toLocaleString(),
        startLocation: startLocationName,
        distance,
        duration,
        avgSpeed: (distance / (duration / 3600)).toFixed(1),
        maxSpeed: maxSpeed.toFixed(1),
        maxLeanLeft,
        maxLeanRight,
        coordinates: routeCoordinates,
      };
      await saveRouteToStorage(newRoute);
      resetRouteData();
      navigation.navigate('routesm');
    } else {
      // setMaxSpeed(0);
    }
    setIsRecording(!isRecording);
  };

  const resetRouteData = () => {
    setDistance(0);
    setDuration(0);
    setSpeed(0);
    setMaxSpeed(0);
    setLeanAngle(0);
    setMaxLeanLeft(0);
    setMaxLeanRight(0);
    setRouteCoordinates([]);
  };

  useEffect(() => {
    let gyroSubscription, accelSubscription;

    Gyroscope.setUpdateInterval(updateInterval);
    Accelerometer.setUpdateInterval(updateInterval);

    let previousTime = Date.now();

    gyroSubscription = Gyroscope.addListener((gyroscopeData) => {
      const { x } = gyroscopeData;
      const now = Date.now();
      const deltaTime = (now - previousTime) / 1000;
      previousTime = now;

      rate = x * 57.2958;
      angle += deltaTime * (rate - bias);

      P[0][0] += deltaTime * (deltaTime * P[1][1] - P[0][1] - P[1][0] + Q_angle);
      P[0][1] -= deltaTime * P[1][1];
      P[1][0] -= deltaTime * P[1][1];
      P[1][1] += Q_bias * deltaTime;
    });

    accelSubscription = Accelerometer.addListener((accelerometerData) => {
      const { x } = accelerometerData;
      const accelAngle = Math.atan2(x * -1, 1) * (180 / Math.PI);

      y = accelAngle - angle;

      S = P[0][0] + R_measure;
      K[0] = P[0][0] / S;
      K[1] = P[1][0] / S;

      angle += K[0] * y;
      bias += K[1] * y;

      const P00_temp = P[0][0];
      const P01_temp = P[0][1];

      P[0][0] -= K[0] * P00_temp;
      P[0][1] -= K[0] * P01_temp;
      P[1][0] -= K[1] * P00_temp;
      P[1][1] -= K[1] * P01_temp;

      const adjustedAngle = Math.round(angle - calibrationOffset);
      setLeanAngle(adjustedAngle);
      setMaxLeanLeft((prevMaxLeanLeft) => Math.min(prevMaxLeanLeft, adjustedAngle));
      setMaxLeanRight((prevMaxLeanRight) => Math.max(prevMaxLeanRight, adjustedAngle));
    });

    return () => {
      gyroSubscription && gyroSubscription.remove();
      accelSubscription && accelSubscription.remove();
    };
  }, [calibrationOffset, isRecording]);

  const handleCalibration = () => {
    setCalibrationOffset(leanAngle);
    setMaxLeanLeft(0);
    setMaxLeanRight(0);
  };

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (location) => {
        const { latitude, longitude, speed: currentSpeed } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setRouteCoordinates((prevCoords) => [...prevCoords, { latitude, longitude }]);
        const speedInKmH = currentSpeed !== null && currentSpeed !== undefined ? (currentSpeed * 3.6).toFixed(1) : '0.0';
        setSpeed(parseFloat(speedInKmH));
    
        setMaxSpeed((prevMaxSpeed) => Math.max(prevMaxSpeed, parseFloat(speedInKmH)));
    
        setGpsSignalStrength(location.coords.accuracy <= 5 ? 'Mocny' : 'Słaby');
      }
    );
  };

  const toggleMap = () => {
    Animated.timing(mapPosition, {
      toValue: isMapVisible ? width : 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      if (!isMapVisible && currentLocation) {
        centerMapToCurrentLocation();
      }
    });
    setIsMapVisible(!isMapVisible);
  };

  const centerMapToCurrentLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const getCityFromLocation = async (location) => {
    try {
      const [reverseGeocode] = await Location.reverseGeocodeAsync(location);
      return reverseGeocode.city || 'Nieznana lokalizacja';
    } catch (error) {
      console.error('Błąd przy pobieraniu nazwy miasta:', error);
      return 'Nieznana lokalizacja';
    }
  };

  const saveRouteToStorage = async (newRoute) => {
    try {
      const storedRoutes = await AsyncStorage.getItem('routes');
      const routes = storedRoutes ? JSON.parse(storedRoutes) : [];
      routes.push(newRoute);
      await AsyncStorage.setItem('routes', JSON.stringify(routes));
    } catch (error) {
      console.error('Błąd podczas zapisywania trasy do AsyncStorage:', error);
    }
  };

  const getNeedleRotation = (currentSpeed) => {
    const maxSpeed = 300; 
    const minAngle = -135;
    const maxAngle = 135; 
    return minAngle + (currentSpeed / maxSpeed) * (maxAngle - minAngle);
  };


const renderSpeedometerScale = () => {
  const marks = [];
  const totalMarks = 16; 
  const maxAngle = 270;
  const angleStep = maxAngle / (totalMarks - 1);

  for (let i = 0; i < totalMarks; i++) {
    const angle = 45 + i * angleStep; 
    const rotation = `${angle}deg`;
    const label = i * 20;

    marks.push(
      <View key={i} style={[styles.scaleMarkContainer, { transform: [{ rotate: rotation }] }]}>
        <View style={styles.scaleMark} />
        <Text style={[styles.scaleLabel, { transform: [{ rotate: `${-angle}deg` }] }]}>
          {label}
        </Text>
      </View>
    );
  }

  return marks;
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.leanContainer}>
        <Text style={styles.maxLeanText}>Max. Lewy: {Math.abs(maxLeanLeft)}°</Text>
        <View style={styles.leanIndicatorContainer}>
          <View style={styles.angleMeter}>
            <Text style={styles.leanText}>{Math.abs(leanAngle)}°</Text>
            <View style={[styles.arrow, { transform: [{ rotate: `${leanAngle}deg` }] }]} />
          </View>
        </View>
        <Text style={styles.maxLeanText}>Max. Prawy: {maxLeanRight}°</Text>
      </View>

      <View style={styles.routeDataContainer}>
      
      <Text style={styles.routeText}>Sygnał GPS: {gpsSignalStrength}</Text>
   
      <View style={styles.detailsContainer}>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Dystans:</Text>
    <Text style={styles.descriptionText}>{distance.toFixed(1)} km</Text>
  </View>

  <View style={styles.detailItem}>
    <Text style={styles.subtitleText}>Czas:</Text>
    <Text style={styles.descriptionText}>{Math.floor(duration / 3600)}g {Math.floor((duration % 3600) / 60)}m {duration % 60}s</Text>
  </View>

      </View>
</View>
  <View style={styles.speedometerContainer}>
        <View style={styles.speedometer}>
          {renderSpeedometerScale()}
          <Text style={styles.speedText}>{speed.toFixed(0)} km/h</Text>
          <Text style={styles.maxSpeedText}>Max. {maxSpeed.toFixed(0)} km/h</Text>

          <View style={styles.needleContainer}>
            <View
              style={[
                styles.needle,
                { transform: [{ rotate: `${getNeedleRotation(speed)}deg` }] },
              ]}
            />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStartStop}>
        <Text style={styles.buttonText}>{isRecording ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.calibrateButton} onPress={handleCalibration}>
        <Text style={styles.buttonText}>Kalibruj</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.mapToggleButton} onPress={toggleMap}>
      <Text style={styles.buttonText}>{isMapVisible ? 'Ukryj mapę' : 'Pokaż mapę'}</Text>
      </TouchableOpacity>

      {isMapVisible && (
        <Animated.View style={[styles.mapContainer, { transform: [{ translateX: mapPosition }] }]}>
          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true} 
            followsUserLocation={true} 
          >
            <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="#007bff" />
          </MapView>
          <TouchableOpacity style={styles.centerButton} onPress={centerMapToCurrentLocation}>
            <MaterialIcons name="my-location" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  leanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  maxLeanText: {
    color: '#fff',
    fontSize: 16,
  },
  leanIndicatorContainer: {
    alignItems: 'center',
  },
  angleMeter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leanText: {
    fontSize: 18,
    color: '#fff',
  },
  arrow: {
    position: 'absolute',
    top: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#007bff',
  },
  routeDataContainer: {
    alignItems: 'center',
  },
  routeText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 5,
    marginTop: 5
  },
  startButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  calibrateButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    position: 'absolute',
    bottom:20,
    right: 20,
    width: 125,
    height:45
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  mapToggleButton: {
    position: 'absolute',
    backgroundColor: '#007bff',
    bottom:20,
    left: 20,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    zIndex: 10,
    width: 125,
    height:45
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: '#121212',
  },
  map: {
    flex: 1,
  },
  centerButton: {
    position: 'absolute',
    top: 10,
    right: 10,    
    marginLeft: -30,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
  },
  leanText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },  
  speedometerContainer: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf:'center',
    marginTop: 30,
    marginBottom: 30
  },
  speedometer: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  speedText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    top: '67%',
  },
  maxSpeedText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    position: 'absolute',
    top: '80%',
  },
  needleContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: '50%',
  },
  needle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#007bff',   
  },
  scaleMarkContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  scaleMark: {
    width: 2,
    height: 15,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 10,
  },
  scaleLabel: {
    color: '#fff',
    position: 'absolute',
    bottom: 30,
    fontSize: 12,
    fontWeight: 'bold',
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

export default NewRouteScreen;
