import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ImageBackground, TouchableOpacity, FlatList, Modal } from 'react-native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { MaterialIcons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 

const windowHeight = Dimensions.get('window').height;

const VehicleTile = ({ vehicle, isChecked, onSelect, onOptions, onEdit, onDelete, onReminders, showOptions }) => {
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
          <TouchableOpacity onPress={onReminders} style={styles.optionButton}>
            <Text style={styles.optionText}>Powiadomienia</Text>
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
  const [modalVisible, setModalVisible] = useState(false);


  
  const handleRemindersPress = async (vin) => {
    try {
      await AsyncStorage.setItem('selectedVehicleVIN', vin);
      navigation.navigate('reminders'); 
    } catch (error) {
      console.error("Błąd przy zapisywaniu VIN:", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const storedVehicles = await AsyncStorage.getItem('vehicles');
      const vehiclesList = storedVehicles ? JSON.parse(storedVehicles) : [];
      setVehicles(vehiclesList);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const loadSelectedVehicle = async () => {
    try {
      const storedVin = await AsyncStorage.getItem('selectedVehicle');
      if (storedVin) {
        const foundVehicle = vehicles.find(vehicle => vehicle.vin === storedVin);
        if (foundVehicle) {
          setSelectedVehicle(foundVehicle);
        }
      }
    } catch (error) {
      console.error("Error loading selected vehicle:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles(); 
    }, [])
  );

  useEffect(() => {
    if (vehicles.length > 0) {
      loadSelectedVehicle();
    }
  }, [vehicles]);

  const handleSelectVehicle = async (vehicle) => {
    try {
      if (selectedVehicle && selectedVehicle.vin === vehicle.vin) {
        setSelectedVehicle(null);
        await AsyncStorage.removeItem('selectedVehicle');
        console.log('Pojazd odznaczony, VIN usunięty z AsyncStorage');
      } else {
        setSelectedVehicle(vehicle);
        await AsyncStorage.setItem('selectedVehicle', vehicle.vin);
        console.log('Pojazd zaznaczony, VIN zapisany:', vehicle.vin);
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania VIN w AsyncStorage:', error);
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
    const updatedVehicles = vehicles.filter(vehicle => vehicle.vin !== vehicleToEditOrDelete.vin);
    setVehicles(updatedVehicles);
    await AsyncStorage.setItem('vehicles', JSON.stringify(updatedVehicles));
    setModalVisible(false);
  };

  const handleEditVehicle = () => {
    if (vehicleToEditOrDelete) {
      navigation.navigate('editVehicle', { vehicle: { ...vehicleToEditOrDelete } });
      setOptionsVisible(null); 
    } else {
      alert('Błąd: Nie wybrano pojazdu');
    }
  };

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
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
              onDelete={handleOpenModal}
              onReminders={() => handleRemindersPress(item.vin)}
              showOptions={optionsVisible === item.vin}
            />
          )}
          keyExtractor={(item) => item.vin}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noVehiclesText}>Brak pojazdów do wyświetlenia</Text>
      )}
   
      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Czy na pewno chcesz usunąć ten pojazd?</Text>
            <TouchableOpacity onPress={handleDeleteVehicle}>
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
    right: -340,
  },
  optionsIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: '#007bff',
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
  noVehiclesText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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

export default VehiclesList;
