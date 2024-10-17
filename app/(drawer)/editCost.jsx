import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageBackground,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

const windowHeight = Dimensions.get('window').height;

const categoryImages = {
  Default: require('../../assets/images/bike.jpg'),
  Paliwo: require('../../assets/images/fuel.jpg'),
  Serwis: require('../../assets/images/service.jpg'),
  Opłaty: require('../../assets/images/fees.jpg'),
  Modyfikacje: require('../../assets/images/tuning.jpg'),
  Eksploatacja: require('../../assets/images/maintenance.jpg'),
};

const EditCost = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cost } = route.params;

  const [category, setCategory] = useState(cost.category);
  const [description, setDescription] = useState(cost.description);
  const [date, setDate] = useState(new Date(cost.date));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState(cost.amount);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    setCategory(cost.category);
    setDescription(cost.description);
    
    const parsedDate = moment(cost.date, 'DD-MM-YYYY'); 
    if (parsedDate.isValid()) {
      setDate(parsedDate.toDate());
    } else {
      console.error("Invalid date format", cost.date);
      setDate(new Date());
    }

    setAmount(cost.amount);
  }, [cost]);

  const handleEditCost = async () => {
    if (category === 'default') {
      alert('Wybierz kategorię.');
      return;
    }

    try {
      const storedCosts = await AsyncStorage.getItem('motorcycleCosts');
      const costs = storedCosts ? JSON.parse(storedCosts) : [];
      const costIndex = costs.findIndex(c => c.id === cost.id);

      if (costIndex > -1) {
        const updatedCost = {
          ...costs[costIndex],
          category,
          description,
          date: date.toLocaleDateString(),
          amount,
          image: categoryImages[category],
        };

        costs[costIndex] = updatedCost;
        await AsyncStorage.setItem('motorcycleCosts', JSON.stringify(costs));
        setModalMessage('Koszt zaktualizowany pomyślnie!');
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error updating cost:", error);
      alert('Wystąpił błąd podczas aktualizacji kosztu.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const selectedImage = categoryImages[category] || categoryImages['default'];

  const handleCloseModal = () => {
    setModalVisible(false); 
    navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.label}>Kategoria</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Wybierz kategorię" value="Brak kategorii" />
        <Picker.Item label="Paliwo" value="Paliwo" />
        <Picker.Item label="Serwis" value="Serwis" />
        <Picker.Item label="Opłaty" value="Opłaty" />
        <Picker.Item label="Modyfikacje" value="Modyfikacje" />
        <Picker.Item label="Eksploatacja" value="Eksploatacja" />
      </Picker>

      <Text style={styles.label}>Opis</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Kwota</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Data</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Button title="Zaktualizuj koszt" onPress={handleEditCost} color="#007bff" />

      <View style={styles.previewContainer}>
        <ImageBackground
          source={selectedImage}
          style={styles.image}
        >
          <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>
        </ImageBackground>

        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>Kategoria:</Text>
          <Text style={styles.descriptionText}>{category}</Text>

          <Text style={styles.subtitleText}>Opis:</Text>
          <Text style={styles.descriptionText}>{description}</Text>

          <Text style={styles.subtitleText}>Kwota:</Text>
          <Text style={styles.descriptionText}>{amount}</Text>

          <Text style={styles.subtitleText}>Data:</Text>
          <Text style={styles.descriptionText}>{date.toLocaleDateString()}</Text>
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
  picker: {
    backgroundColor: '#2D2F33',
    borderRadius: 10,
    color: '#fff',
    marginBottom: 15,
  },
  datePicker: {
    backgroundColor: '#2D2F33',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  dateText: {
    color: '#fff',
  },
  previewContainer: {
    height: windowHeight / 3 - 70,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    marginBottom: 20,
    position: 'relative',
    marginTop: 30
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
    marginLeft: 50,
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

export default EditCost;
