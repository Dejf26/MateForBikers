import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  SafeAreaView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const apiKey = '27bb4bc7c58ad4562286aded0cb8e50b';

const AddCity = () => {
  const [city, setCity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigation = useNavigation();

  const handleAddCity = async () => {
    const trimmedCity = city.trim();

    if (trimmedCity === '') {
      setModalMessage('Wprowadź nazwę miasta.');
      setModalVisible(true);
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${trimmedCity}&appid=${apiKey}`
      );

      if (!response.ok) {
        setModalMessage('Nie znaleziono podanej lokalizacji. Sprawdź nazwę miasta.');
        setModalVisible(true);
        return;
      }

      const storedCities = await AsyncStorage.getItem('cities');
      const cityList = storedCities ? JSON.parse(storedCities) : [];

      if (cityList.some((existingCity) => existingCity.toLowerCase() === trimmedCity.toLowerCase())) {
        setModalMessage('Miasto jest już na liście.');
        setModalVisible(true);
        return;
      }

      cityList.push(trimmedCity);
      await AsyncStorage.setItem('cities', JSON.stringify(cityList));
      navigation.goBack();
      setCity('');
    } catch (error) {
      console.error('Error adding city:', error);
      setModalMessage('Wystąpił błąd podczas dodawania miasta. Spróbuj ponownie.');
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Dodaj miasto</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="Wprowadź nazwę miasta"
        placeholderTextColor="#6e6e6e"
      />
      <Button title="Dodaj" onPress={handleAddCity} color="#007bff" />

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={[styles.modalButton, { backgroundColor: '#007bff' }]}>Ok</Text>
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
    padding: 20,
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

export default AddCity;
