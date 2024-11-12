import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotificationScreen = () => {
  const [filteredReminders, setFilteredReminders] = useState([]);



  useEffect(() => {
    const loadStoredReminders = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const reminderKeys = keys.filter(key => key.startsWith('reminders_'));
        const allReminders = [];

        for (const reminderKey of reminderKeys) {
          const vin = reminderKey.replace('reminders_', '');
          const reminders = JSON.parse(await AsyncStorage.getItem(reminderKey)) || [];

          const vehicleData = JSON.parse(await AsyncStorage.getItem('vehicles')) || [];
          const matchedVehicle = vehicleData.find(vehicle => vehicle.vin === vin);

          const today = new Date();

          reminders.forEach(reminder => {
            const endDate = new Date(reminder.endDate.split('.').reverse().join('-'));
            const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

            if (reminder.daysBefore >= daysUntilEnd) {
              allReminders.push({
                ...reminder,
                daysUntilEnd,
                vehicleName: matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : 'Nieznany pojazd',
              });
            }
          });
        }

        setFilteredReminders(allReminders);
      } catch (error) {
        console.error("Błąd przy ładowaniu przypomnień:", error);
      }
    };

    loadStoredReminders();
  }, []);

  const renderReminder = ({ item }) => (
    <View style={styles.reminderContainer}>
      <Text style={styles.reminderText}>Pojazd: {item.vehicleName}</Text>
      <Text style={styles.reminderText}>Rodzaj: {item.category}</Text>
      <Text style={styles.reminderText}>Data końcowa: {item.endDate}</Text>
      <Text style={styles.reminderText}>Dni do końca: {item.daysUntilEnd}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Powiadomienia</Text>
      {filteredReminders.length > 0 ? (
        <FlatList
          data={filteredReminders}
          renderItem={renderReminder}
          keyExtractor={(item) => `${item.vehicleName}_${item.id}`}
        />
      ) : (
        <Text style={styles.noRemindersText}>Brak przypomnień do wyświetlenia</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
  },
  reminderContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reminderText: {
    color: '#fff',
    fontSize: 16,
  },
  noRemindersText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NotificationScreen;
