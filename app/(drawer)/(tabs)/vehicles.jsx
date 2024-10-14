import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, FlatList } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { MaterialIcons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

const windowHeight = Dimensions.get('window').height;

const VehicleTile = ({ vehicle, isChecked, onSelect, onOptions, onEdit, onDelete, showOptions }) => {
  const imageSource = vehicle.image.uri ? { uri: vehicle.image.uri } : vehicle.image || require('../../../assets/images/bike.jpg');

  return (
    <View style={styles.tileContainer}>
      <ImageBackground source={imageSource} style={styles.image}>
        <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>
      </ImageBackground>
      <View style={styles.textContainer}>
        <Text style={styles.subtitleText}>Marka:</Text>
        <Text style={styles.descriptionText}>{vehicle.brand}</Text>
       
        <Text style={styles.subtitleText}>Model:</Text>
        <Text style={styles.descriptionText}>{vehicle.model}</Text>
        
        <Text style={styles.subtitleText}>Rok produkcji:</Text>
        <Text style={styles.descriptionText}>{vehicle.year}</Text>

        <Text style={styles.subtitleText}>VIN:</Text>
        <Text style={styles.descriptionText}>{vehicle.vin}</Text>
      </View>
      <BouncyCheckbox
        isChecked={isChecked}
        size={30}
        fillColor="#007bff"
        unfillColor="#FFFFFF"
        onPress={onSelect}
        iconStyle={{ borderColor: "#2D2F33" }}
        style={styles.checkbox}
      />
      <TouchableOpacity style={styles.optionsIcon} onPress={onOptions}>
        <MaterialIcons name="more-horiz" size={30} color="#007bff" />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={onEdit} style={styles.optionButton}>
            <Text style={styles.optionText}>Edytuj</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.optionButton}>
            <Text style={styles.optionText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const VehiclesList = () => {
  const navigation = useNavigation();

  const [vehicles, setVehicles] = useState([]);
  const [vehicleToEditOrDelete, setVehicleToEditOrDelete] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(null); 

  const fetchVehicles = async () => {
    try {
      const storedVehicles = await AsyncStorage.getItem('vehicles');
      const vehiclesList = storedVehicles ? JSON.parse(storedVehicles) : [];
      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles(); 
    }, [])
  );

  const handleSelectVehicle = (vehicle) => {
    if (selectedVehicle && selectedVehicle.vin === vehicle.vin) {
      setSelectedVehicle(null);
    } else {
      setSelectedVehicle(vehicle);
    }
  };

  const handleOptions = (vehicle) => {
    if (optionsVisible === vehicle.vin) {
      setOptionsVisible(null); 
    } else {
      setOptionsVisible(vehicle.vin);
    }
    setVehicleToEditOrDelete(vehicle);
  };

  const handleDeleteVehicle = async () => {
    try {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.vin !== vehicleToEditOrDelete.vin);
      await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
      setVehicles(updatedVehicles);
      alert('Pojazd usunięty!');
      setOptionsVisible(null);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleEditVehicle = () => {
    if (vehicleToEditOrDelete) {
      navigation.navigate('editVehicle', { vehicle: { ...vehicleToEditOrDelete } });
      setOptionsVisible(null); 
    } else {
      alert('Błąd: Nie wybrano pojazdu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {vehicles && vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          renderItem={({ item }) => (
            <VehicleTile
              vehicle={item}
              isChecked={selectedVehicle && selectedVehicle.vin === item.vin}
              onSelect={() => handleSelectVehicle(item)}
              onOptions={() => handleOptions(item)}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              showOptions={optionsVisible === item.vin}
            />
          )}
          keyExtractor={(item) => item.vin}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noVehiclesText}>Brak pojazdów do wyświetlenia</Text>
      )}
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
  checkbox: {
    position: 'absolute',
    top: 10,
    right: -345,
  },
  optionsIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: '#007bff'
  },
  noVehiclesText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
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
    marginVertical: 2,
  },
  optionText: {
    color: 'white',
  },
});

export default VehiclesList;
