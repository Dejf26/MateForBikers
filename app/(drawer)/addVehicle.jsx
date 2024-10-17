import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const AddVehicle = () => {
  const navigation = useNavigation();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vin, setVin] = useState('');
  const [vehicleImage, setVehicleImage] = useState(require('../../assets/images/bike.jpg')); 
  const [menuVisible, setMenuVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [modalMessage, setModalMessage] = useState(''); 

  const handleAddVehicle = async () => {
    try {
      const storedVehicles = await AsyncStorage.getItem('vehicles');
      const vehicles = storedVehicles ? JSON.parse(storedVehicles) : [];

      const isVinDuplicate = vehicles.some(vehicle => vehicle.vin === vin);

      if (isVinDuplicate) {
        setModalMessage('Pojazd z tym samym VIN już istnieje!');
        setModalVisible(true); 
        return;
      }

      const newVehicle = {
        brand,
        model,
        year,
        vin,
        image: vehicleImage || require('../../assets/images/bike.jpg'),
      };

      vehicles.push(newVehicle);
      await AsyncStorage.setItem('vehicles', JSON.stringify(vehicles));
      setModalMessage('Pojazd dodany pomyślnie');
      setModalVisible(true); 

      setBrand('');
      setModel('');
      setYear('');
      setVin('');
      setVehicleImage(require('../../assets/images/bike.jpg')); 

    } catch (error) {
      console.error("Error adding vehicle:", error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setModalMessage('Musisz dać pozwolenie, aby wybrać zdjęcie!');
      setModalVisible(true); 
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      setVehicleImage({ uri: selectedImageUri });
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false); 
    navigation.navigate('vehicles'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Marka</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} />
        <Text style={styles.label}>Model</Text>
        <TextInput style={styles.input} value={model} onChangeText={setModel} />
        <Text style={styles.label}>Rok produkcji</Text>
        <TextInput style={styles.input} value={year} onChangeText={setYear} />
        <Text style={styles.label}>Vin</Text>
        <TextInput style={styles.input} value={vin} onChangeText={setVin} />
        <Button title="Dodaj pojazd" onPress={handleAddVehicle} color="#007bff" />
      </View>

      <View style={styles.previewContainer}>
        <ImageBackground
          source={vehicleImage.uri ? { uri: vehicleImage.uri } : vehicleImage}
          style={styles.image}
        >
          <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>

          <TouchableOpacity style={styles.menuIcon} onPress={() => setMenuVisible(!menuVisible)}>
            <MaterialIcons name="more-horiz" size={30} color="#007bff" />
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <Text style={styles.optionText}>Dodaj zdjęcie</Text>
              </TouchableOpacity>
            </View>
          )}
        </ImageBackground>

        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>Marka:</Text>
          <Text style={styles.descriptionText}>{brand}</Text>

          <Text style={styles.subtitleText}>Model:</Text>
          <Text style={styles.descriptionText}>{model}</Text>

          <Text style={styles.subtitleText}>Rok produkcji:</Text>
          <Text style={styles.descriptionText}>{year}</Text>

          <Text style={styles.subtitleText}>VIN:</Text>
          <Text style={styles.descriptionText}>{vin}</Text>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Button title="OK" onPress={handleCloseModal} color="#007bff" />
          </View>
        </View>
      </Modal>

      <StatusBar style="light" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    marginTop: -30,
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#2D2F33',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    marginBottom: 15,
  },
  previewContainer: {
    marginTop: 20,
    height: 200,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  skewedTextContainer: {
    width: '125%',
    height: '150%',
    padding: 10,
    marginLeft: -180,
    transform: [{ translateY: 0 }, { rotate: '-75deg' }],
  },
  menuIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
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
  },
  subtitleText: {
    color: '#6e6e6e',
    fontSize: 13,
  },
  descriptionText: {
    color: 'white',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2D2F33',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    color: '#fff',
    marginBottom: 15,
  },
});

export default AddVehicle;