import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Polyline } from 'react-native-maps';

const windowHeight = Dimensions.get('window').height;

const RouteTile = ({ route, onOpenMap, onDelete }) => {

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const initialRegion = route.coordinates.length > 0
  ? {
      latitude: route.coordinates[0].latitude,
      longitude: route.coordinates[0].longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  : null;

  return (
    <View style={styles.tileContainer}>
          {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Polyline
            coordinates={route.coordinates}
            strokeWidth={4}
            strokeColor="blue"
          />
        </MapView>
      ) : (
        <View style={styles.noMapContainer}>
          <Text style={styles.errorText}>Brak współrzędnych dla tej trasy</Text>
        </View>
      )}
      <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>

      <View style={styles.textContainer}>
        <Text style={styles.subtitleText}>Początek trasy:</Text>
        <Text style={styles.descriptionText}>{route.startLocation}</Text> 
        <Text style={styles.subtitleText}>Dystans:</Text>
        <Text style={styles.descriptionText}>{(route.distance).toFixed(1)} km</Text>
        <Text style={styles.subtitleText}>Czas trwania:</Text>
        <Text style={styles.descriptionText}>{Math.floor(route.duration / 3600)}g {Math.floor((route.duration % 3600) / 60)}m {route.duration % 60}s</Text>
        <Text style={styles.subtitleText}>Prędkość (km/h):</Text>
        <Text style={styles.descriptionText}>Śr. {route.avgSpeed}   Max. {route.maxSpeed} </Text>
        <Text style={styles.subtitleText}>Katy pochylenia:</Text>
        <Text style={styles.descriptionText}>Prawy {route.maxLeanRight}°   Lewy {Math.abs(route.maxLeanLeft)}° </Text>
      </View>
      <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(!menuVisible)}>
            <MaterialIcons name="more-horiz" size={30} color="#007bff" />
          </TouchableOpacity>
      {menuVisible && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionButton} onPress={() => onOpenMap(route)}>
            <Text style={styles.optionText}>Szczegóły</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => onDelete(route.id)}>
            <Text style={styles.optionText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const RoutesScreen = () => {
  const navigation = useNavigation();
  const [routes, setRoutes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  const fetchRoutes = async () => {
    try {
      const storedRoutes = await AsyncStorage.getItem('routes');
      if (storedRoutes) {
        setRoutes(JSON.parse(storedRoutes));
      }
    } catch (error) {
      console.error('Błąd przy pobieraniu tras z AsyncStorage:', error);
    }
  };

  const deleteRoute = async () => {
    if (routeToDelete !== null) {
      const updatedRoutes = routes.filter(route => route.id !== routeToDelete);
      setRoutes(updatedRoutes);
      await AsyncStorage.setItem('routes', JSON.stringify(updatedRoutes));
      setModalVisible(false);
      setRouteToDelete(null);
    }
  };

  const handleOpenModal = (routeId) => {
    setRouteToDelete(routeId); 
    setModalVisible(true);
  };
  

  const handleCloseModal = () => {
    setModalVisible(false);
    setRouteToDelete(null);
  };

  const openRouteOnMap = (route) => {
    navigation.navigate('routeDetails', { routeId: route.id });
  };

  useFocusEffect(
    useCallback(() => {
      fetchRoutes();
    }, [])
  );

  const renderRoute = ({ item }) => (
    <RouteTile 
      route={item} 
      onOpenMap={openRouteOnMap} 
      onDelete={() => handleOpenModal(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={routes}
        renderItem={renderRoute}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Brak zarejestrowanych tras</Text>}
        contentContainerStyle={styles.listContainer}
      />
      <StatusBar style="light" />

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Czy na pewno chcesz usunąć tę trasę?</Text>
            <TouchableOpacity onPress={deleteRoute}>
              <Text style={[styles.modalButton, { backgroundColor: '#d9534f' }]}>Usuń</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCloseModal}>
              <Text style={[styles.modalButton, { backgroundColor: '#007bff' }]}>Anuluj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 6,
    marginTop: -13
  },
  tileContainer: {
    height: windowHeight / 3 - 70,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
    position: 'relative',
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
    marginLeft: 60,
  },
  skewedTextContainer: {
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
    fontSize: 18,
    fontWeight: 'bold',
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
  iconContainer: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 5,
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 40,
    right: 10,
    backgroundColor: '#2D2F33',
    borderRadius: 5,
    padding: 5,
    elevation: 5,
    zIndex: 1,
  },
  optionButton: {
    padding: 5,
  },
  optionText: {
    color: 'white',
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  map: {
    width: 170,
    height: '100%', 
    borderRadius: 10,
    position: 'absolute',
    right: 0,
  },
  noMapContainer: {
    width: 170,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2D2F33',
    borderRadius: 10,
  },
  menuIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#2D2F33',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  modalButton: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    textAlign: 'center',
    marginVertical: 5,
  },
});

export default RoutesScreen;
