import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const windowHeight = Dimensions.get('window').height;

const categoryImages = {
  Default: require('../../../assets/images/bike.jpg'),
  Paliwo: require('../../../assets/images/fuel.jpg'),
  Serwis: require('../../../assets/images/service.jpg'),
  Opłaty: require('../../../assets/images/fees.jpg'),
  Modyfikacje: require('../../../assets/images/tuning.jpg'),
  Eksploatacja: require('../../../assets/images/maintenance.jpg'),
};

const MotorcycleCosts = () => {
  const [costs, setCosts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedCost, setSelectedCost] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [visibleOptions, setVisibleOptions] = useState({});

  const navigation = useNavigation();

  const fetchCosts = async () => {
    const storedCosts = await AsyncStorage.getItem('motorcycleCosts');
    if (storedCosts) {
      setCosts(JSON.parse(storedCosts));
    }
  };

  const fetchVehicles = async () => {
    const storedVehicles = await AsyncStorage.getItem('vehicles');
    if (storedVehicles) {
      setVehicles(JSON.parse(storedVehicles));
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCosts();
      fetchVehicles();
    }, [])
  );

  const getVehicleDetailsByVin = (vin) => {
    const vehicle = vehicles.find((v) => v.vin === vin);
    return vehicle
      ? { name: vehicle.brand, model: vehicle.model, image: vehicle.image.uri || vehicle.image }
      : { name: 'Nieznana marka', model: 'Nieznany model', image: categoryImages.Default };
  };

  const handleDeleteCost = async (costId) => {
    const updatedCosts = costs.filter((cost) => cost.id !== costId);
    setCosts(updatedCosts);
    await AsyncStorage.setItem('motorcycleCosts', JSON.stringify(updatedCosts));
    setModalVisible(false);
  };

  const handleToggleMenu = (costId) => {
    setVisibleOptions((prev) => ({
      ...prev,
      [costId]: !prev[costId],
    }));
  };

  const handleOpenModal = (cost) => {
    setSelectedCost(cost);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleEditCost = (cost) => {
    navigation.navigate('editCost', { cost });
    handleToggleMenu(cost.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {costs.length === 0 ? (
          <Text style={styles.noCostsText}>Brak kosztów do wyświetlenia.</Text>
        ) : (
          costs.map((cost) => {
            const { name, model } = getVehicleDetailsByVin(cost.vin);
            const costImage = categoryImages[cost.category] || categoryImages.Default;

            return (
              <View key={cost.id} style={styles.tileContainer}>
                <ImageBackground source={costImage} style={styles.image}>
                  <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>
                </ImageBackground>
                <View style={styles.textContainer}>
                  <Text style={styles.subtitleText}>Pojazd:</Text>
                  <Text style={styles.descriptionText}>{`${name} ${model}`}</Text>

                  <Text style={styles.subtitleText}>Kategoria:</Text>
                  <Text style={styles.descriptionText}>{cost.category}</Text>

                  {cost.description && (
                    <>
                      <Text style={styles.subtitleText}>Opis:</Text>
                      <Text style={styles.descriptionText}>{cost.description}</Text>
                    </>
                  )}

                  <Text style={styles.subtitleText}>Kwota:</Text>
                  <Text style={styles.descriptionText}>{`${cost.amount} zł`}</Text>
                  
                  <Text style={styles.subtitleText}>Data:</Text>
                  <Text style={styles.descriptionText}>{cost.date}</Text>
                </View>

                <TouchableOpacity style={styles.optionsIcon} onPress={() => handleToggleMenu(cost.id)}>
                  <MaterialIcons name="more-horiz" size={30} color="#007bff" />
                </TouchableOpacity>

                {visibleOptions[cost.id] && (
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity onPress={() => handleEditCost(cost)} style={styles.optionButton}>
                      <Text style={styles.optionText}>Edytuj</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleOpenModal(cost)} style={styles.optionButton}>
                      <Text style={styles.optionText}>Usuń</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Czy na pewno chcesz usunąć ten koszt?</Text>
            <TouchableOpacity onPress={() => handleDeleteCost(selectedCost.id)}>
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
    marginTop: -13,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  noCostsText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
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
  subtitleText: {
    color: '#6e6e6e',
    fontSize: 13,
    marginBottom: -5,
  },
  descriptionText: {
    color: 'white',
    fontSize: 15,
    marginTop: -5,
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

export default MotorcycleCosts;
