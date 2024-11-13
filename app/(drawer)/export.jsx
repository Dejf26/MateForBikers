import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as CSV from 'papaparse';

const ExportImport = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const showModal = (message, error = false) => {
    setModalMessage(message);
    setIsError(error);
    setModalVisible(true);
  };

  const exportData = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const allData = [];

      for (const key of keys) {
        let value = await AsyncStorage.getItem(key);

        try {
          value = JSON.parse(value);
        } catch (e) {
          // 
        }

        allData.push({ key, value: typeof value === 'string' ? value : JSON.stringify(value) });
      }

      const csvString = CSV.unparse(allData);
      const fileUri = FileSystem.documentDirectory + 'backup.csv';
      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri);
      showModal("Export zakończony pomyślnie.");
    } catch (error) {
      console.error("Error exporting data:", error);
      showModal("Błąd eksportu: Wystąpił problem z eksportem danych.", true);
    }
  };

  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      console.log("Selected document:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;

        if (fileUri && fileName.endsWith('.csv')) {
          const csvData = await FileSystem.readAsStringAsync(fileUri);
          console.log("CSV Data:", csvData);

          const parsedData = CSV.parse(csvData, { header: true });
          if (parsedData.errors.length) {
            console.error("CSV parsing errors:", parsedData.errors);
            showModal("Błąd importu: Wystąpił problem z przetwarzaniem pliku CSV.", true);
            return;
          }

          const data = parsedData.data;
          console.log("Parsed Data:", data);

          for (const entry of data) {
            if (entry.key && entry.value !== undefined) {
              const key = entry.key;
              const value = entry.value;
              await AsyncStorage.setItem(key, value);
              console.log(`Stored: ${key} = ${value}`);
            } else {
              console.warn("Skipping invalid entry:", entry);
            }
          }

          showModal("Import zakończony pomyślnie.");
        } else {
          showModal("Nieprawidłowy plik: Wybierz poprawny plik CSV.", true);
        }
      } else {
        console.log("Import cancelled.");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      showModal("Błąd importu: Wystąpił problem podczas importu danych.", true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={exportData}>
        <Text style={styles.buttonText}>Eksportuj dane do CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={importData}>
        <Text style={styles.buttonText}>Importuj dane z CSV</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isError && { backgroundColor: '#d9534f' }]}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButton}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#007bff',
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default ExportImport;
