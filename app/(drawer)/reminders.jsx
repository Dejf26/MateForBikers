import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ImageBackground, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const windowHeight = Dimensions.get('window').height;

const categoryImages = {
  Default: require('../../assets/images/bike.jpg'),
  Przegląd: require('../../assets/images/inspection.jpg'),
  Ubezpieczenie: require('../../assets/images/insurance.jpg'),
};

const Reminders = () => {
  const [reminders, setReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadReminders = async () => {
        try {
          const storedReminders = await AsyncStorage.getItem('vehicleReminders');
          const parsedReminders = storedReminders ? JSON.parse(storedReminders) : [];
          setReminders(parsedReminders);
        } catch (error) {
          console.error("Error loading reminders:", error);
        }
      };
      loadReminders();
    }, [])
  );

  const deleteReminder = async (id) => {
    try {
      const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
      setReminders(updatedReminders);
      await AsyncStorage.setItem('vehicleReminders', JSON.stringify(updatedReminders));
      setModalVisible(false);
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleOptions = (reminder) => {
    if (optionsVisible === reminder.id) {
      setOptionsVisible(null);
    } else {
      setOptionsVisible(reminder.id);
    }
    setSelectedReminder(reminder);
  };

  const handleDelete = () => {
    setModalVisible(true);
  };

  const renderReminderItem = ({ item }) => {
    const selectedImage = categoryImages[item.category] || categoryImages['Default'];
    return (
      <View style={styles.tileContainer}>
        <ImageBackground source={selectedImage} style={styles.image}>
          <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>
        </ImageBackground>
        <View style={styles.textContainer}>
          <Text style={styles.subtitleText}>Rodzaj:</Text>
          <Text style={styles.descriptionText}>{item.category}</Text>

          <Text style={styles.subtitleText}>Data od:</Text>
          <Text style={styles.descriptionText}>{item.startDate}</Text>

          <Text style={styles.subtitleText}>Data do:</Text>
          <Text style={styles.descriptionText}>{item.endDate}</Text>

          <Text style={styles.subtitleText}>Dni do przypomnienia:</Text>
          <Text style={styles.descriptionText}>{item.daysBefore}</Text>
        </View>

        <TouchableOpacity style={styles.optionsIcon} onPress={() => handleOptions(item)}>
          <MaterialIcons name="more-horiz" size={30} color="#007bff" />
        </TouchableOpacity>

        {optionsVisible === item.id && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={handleDelete} style={styles.optionButton}>
              <Text style={styles.optionText}>Usuń</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
          {reminders && reminders.length > 0 ? (
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollViewContent}
      />
    ) : (
        <Text style={styles.noRemindersText}>Brak powiadomień do wyświetlenia</Text>
    )}

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Czy na pewno chcesz usunąć to przypomnienie?</Text>
            <TouchableOpacity onPress={() => deleteReminder(selectedReminder.id)}>
            <Text style={[styles.modalButton, { backgroundColor: '#d9534f' }]}>Usuń</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
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
      noRemindersText: {
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

export default Reminders;
