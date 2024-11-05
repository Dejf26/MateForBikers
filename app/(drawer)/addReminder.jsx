import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const windowHeight = Dimensions.get('window').height;

const categoryImages = {
    Default: require('../../assets/images/bike.jpg'),
    Przegląd: require('../../assets/images/inspection.jpg'),
    Ubezpieczenie: require('../../assets/images/insurance.jpg'),
};

const AddReminder = () => {
  const navigation = useNavigation();
  const [category, setCategory] = useState('');
  const [daysBefore, setDaysBefore] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [previewImage, setPreviewImage] = useState(categoryImages['Default']);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(false);
    setStartDate(currentDate);

    const newEndDate = new Date(currentDate);
    newEndDate.setFullYear(newEndDate.getFullYear() + 1);
    setEndDate(newEndDate);
  };
  
  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(false);
    setEndDate(currentDate);
  };
  
  const handleAddReminder = async () => {
    const reminder = {
      id: Date.now().toString(),
      category,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      daysBefore,
    };

    try {
      const storedReminders = await AsyncStorage.getItem('vehicleReminders');
      const reminders = storedReminders ? JSON.parse(storedReminders) : [];
      reminders.push(reminder);
      await AsyncStorage.setItem('vehicleReminders', JSON.stringify(reminders));
      navigation.navigate('reminders');
      resetForm();
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };

  const resetForm = () => {
    setCategory('');
    setStartDate(new Date());
    setEndDate(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
    setDaysBefore('');
    setPreviewImage(categoryImages['Default']);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rodzaj przypomnienia</Text>
      <Picker
        selectedValue={category}
        onValueChange={(value) => {
          setCategory(value);
          setPreviewImage(categoryImages[value] || categoryImages['Default']);
        }}
        style={styles.picker}
      >
        <Picker.Item label="Wybierz rodzaj" value="" />
        <Picker.Item label="Przegląd" value="Przegląd" />
        <Picker.Item label="Ubezpieczenie" value="Ubezpieczenie" />
      </Picker>

      <Text style={styles.label}>Data od:</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <Text style={styles.input}>{startDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onChangeStartDate}
        />
      )}

      <Text style={styles.label}>Data do:</Text>
      <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
        <Text style={styles.input}>{endDate.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onChangeEndDate}
        />
      )}

      <Text style={styles.label}>Przypomnienie przed upływem (dni)</Text>
      <Picker
        selectedValue={daysBefore}
        onValueChange={(value) => setDaysBefore(value)}
        style={styles.picker}
      >
        <Picker.Item label="Wybierz dni" value="" />
        {[...Array(30).keys()].map((day) => (
          <Picker.Item key={day + 1} label={`${day + 1}`} value={`${day + 1}`} />
        ))}
      </Picker>

      <Button title="Dodaj przypomnienie" onPress={handleAddReminder} color="#007bff" />

      <View style={styles.tileContainer}>
        <ImageBackground source={previewImage} style={styles.image}>
        <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>
        </ImageBackground>
        
        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>Rodzaj:</Text>
          <Text style={styles.descriptionText}>{category}</Text>

          <Text style={styles.subtitleText}>Data od:</Text>
          <Text style={styles.descriptionText}>{startDate.toLocaleDateString()}</Text>

          <Text style={styles.subtitleText}>Data do:</Text>
          <Text style={styles.descriptionText}>{endDate.toLocaleDateString()}</Text>

          <Text style={styles.subtitleText}>Dni do przypomnienia:</Text>
          <Text style={styles.descriptionText}>{daysBefore}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    flex: 1,
  },
  label: {
    color: '#fff',
    marginBottom: 5,
  },
  picker: {
    backgroundColor: '#2D2F33',
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#2D2F33',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    marginBottom: 15,
  },
  tileContainer: {
    height: windowHeight / 3 - 70,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 20,
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
});

export default AddReminder;
