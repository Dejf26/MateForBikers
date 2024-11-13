import React from 'react';
import { View, Button, Alert, StyleSheet, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as CSV from 'papaparse';

const ExportImport = () => {
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
      Alert.alert("Export Success", "Data exported successfully.");
    } catch (error) {
      console.error("Error exporting data:", error);
      Alert.alert("Export Error", "An error occurred while exporting the data.");
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
            Alert.alert("Import Error", "There was an error parsing the CSV file.");
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

          Alert.alert("Import Success", "Data imported successfully.");
        } else {
          Alert.alert("Invalid File", "Please select a valid CSV file.");
        }
      } else {
        console.log("Import cancelled.");
      }
    } catch (error) {
      console.error("Error importing data:", error);
      Alert.alert("Import Error", "An error occurred while importing the data.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={exportData}>
        <Text style={styles.buttonText}>Export Data to CSV</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={importData}>
        <Text style={styles.buttonText}>Import Data from CSV</Text>
      </TouchableOpacity>
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
});

export default ExportImport;
