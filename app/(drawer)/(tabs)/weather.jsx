import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Button,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { relativeTimeRounding } from 'moment';

const windowHeight = Dimensions.get('window').height;
const apiKey = '27bb4bc7c58ad4562286aded0cb8e50b';

const translateCondition = (condition) => {
  switch (condition) {
    case 'clear sky':
      return 'Bezchmurnie';
   case 'overcast clouds':
      return 'Zachmurzenie';
   case 'few clouds':
      return 'Małe zachmurzenie';
    case 'scattered clouds':
      return 'Rozproszone chmury';
    case 'broken clouds':
      return 'Duże zachmurzenie';
    case 'shower rain':
      return 'Przelotne opady deszczu';
    case 'rain':
      return 'Deszcz';
      case 'light rain':
        return 'Lekki deszcz';
    case 'thunderstorm':
      return 'Burza';
    case 'snow':
      return 'Śnieg';
    case 'mist':
      return 'Mgła';
    default:
      return condition;
  }
};

const WeatherTile = ({ city, weather, isChecked, onSelect, onOptions, onEdit, onDelete, showOptions }) => {
  const { temp, windSpeed, conditions, rainChance, icon } = weather;

  return (
    <View style={styles.tileContainer}>
      <View style={styles.conditionContainer}>
        <View style={styles.iconContainer}>
          <Image
            source={{ uri: `https://openweathermap.org/img/w/${icon}.png` }}
            style={styles.weatherIcon}
          />
          <Text style={styles.tempText}>{temp}°C</Text>
        </View>
      </View>

      <View style={[styles.skewedTextContainer, { backgroundColor: '#2D2F33' }]}></View>

      <View style={styles.textContainer}>
        <Text style={styles.subtitleText}>Miasto:</Text>
        <Text style={styles.descriptionText}>{city}</Text>
        <Text style={styles.subtitleText}>Warunki:</Text>
        <Text style={styles.descriptionText}>{translateCondition(conditions)}</Text>
        <Text style={styles.subtitleText}>Wiatr:</Text>
        <Text style={styles.descriptionText}>{windSpeed} km/h</Text>
        <Text style={styles.subtitleText}>Szansa na opady:</Text>
        <Text style={styles.descriptionText}>{rainChance}%</Text>
      </View>

      <BouncyCheckbox
        isChecked={isChecked}
        size={30}
        fillColor="#2D2F33"
        unfillColor="#FFFFFF"
        onPress={onSelect}
        iconStyle={{ borderColor: "#2D2F33" }}
        style={styles.checkbox}
      />

      <TouchableOpacity style={styles.optionsIcon} onPress={onOptions}>
        <MaterialIcons name="more-horiz" size={30} color="#2D2F33" />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity onPress={onEdit} style={styles.optionButton}>
            <Text style={styles.optionText}>Szczegóły</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.optionButton}>
            <Text style={styles.optionText}>Usuń</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const WeatherList = () => {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(null);
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [storedCity, setStoredCity] = useState(null);


  useEffect(() => {
    if (isFocused) {
      loadCities();
    }
  }, [isFocused]);

  useEffect(() => {
    fetchWeatherData();
  }, [cities]);

  useEffect(() => {
    if (cities.length > 0) {
      loadSelectedWeather();
    }
  }, [cities]);

  const loadCities = async () => {
    try {
      const storedCities = await AsyncStorage.getItem('cities');
      const cityList = storedCities ? JSON.parse(storedCities) : [];
      setCities(cityList);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  //////////////
  const loadSelectedWeather = async () => {
    try {
      const storedCityData = await AsyncStorage.getItem('selectedWeather');
      if (storedCityData) {
        const parsedData = JSON.parse(storedCityData);  // Parsowanie obiektu JSON
        setSelectedWeather(parsedData.city);  // Ustawienie miasta
        setWeatherData(prevState => ({
          ...prevState,
          [parsedData.city]: parsedData,  // Zaktualizowanie danych pogodowych
        }));
      }
    } catch (error) {
      console.error('Error loading selected weather:', error);
    }
  };

  


  // useEffect(() => {
  //   const loadSelectedWeather = async () => {
  //     try {
  //       const storedWeather = await AsyncStorage.getItem('selectedWeather');
  //       if (storedWeather) {
  //         const parsedWeather = JSON.parse(storedWeather);
  //         setSelectedWeather(parsedWeather.city);
  //       }
  //     } catch (error) {
  //       console.error('Error loading selected weather:', error);
  //     }
  //   };
  
  //   loadSelectedWeather();
  // }, []);
  

  const handleSelectWeather = async (city) => {
    try {
      const weather = weatherData[city];
      if (selectedWeather === city) {
        setSelectedWeather(null);
        await AsyncStorage.removeItem('selectedWeather');
      } else {
        setSelectedWeather(city);
        await AsyncStorage.setItem('selectedWeather', JSON.stringify({ city, ...weather }));
      }
    } catch (error) {
      console.error('Error saving selected weather:', error);
    }
  };
  
///////////////////  

  const handleOptions = (city) => {
    if (optionsVisible === city) {
      setOptionsVisible(null); 
    } else {
      setOptionsVisible(city);
    }
    setSelectedCity(city);
  };

  const handleDeleteCity = async () => {
    const updatedCities = cities.filter((item) => item !== selectedCity);
    setCities(updatedCities);
    await AsyncStorage.setItem('cities', JSON.stringify(updatedCities));
    setModalVisible(false);
    setOptionsVisible(false);
  };

  const handleViewDetails = () => {
    setOptionsVisible(false);
    navigation.navigate('weatherDetails', { city: selectedCity });
  };

  const handleAddCity = () => {
    navigation.navigate('addWeather');
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const fetchWeatherData = async () => {
    const updatedWeatherData = {};
    for (let city of cities) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        const data = await response.json();
        updatedWeatherData[city] = {
          temp: data.main.temp.toFixed(0),
          windSpeed: data.wind.speed.toFixed(1),
          conditions: data.weather[0].description,
          rainChance: data.clouds.all,
          icon: data.weather[0].icon,
        };
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    }
    setWeatherData(updatedWeatherData);
  };

  return (
    <SafeAreaView style={styles.container}>
    <FlatList
      data={cities}
      keyExtractor={(item) => item}
      renderItem={({ item }) => {
        const weather = weatherData[item] || {};
        return (
          <WeatherTile
            city={item}
            weather={weather}
            isChecked={selectedWeather === item}
            onSelect={() => handleSelectWeather(item)}
            onOptions={() => handleOptions(item)}
            onEdit={handleViewDetails}
            onDelete={() => setModalVisible(true)}
            showOptions={optionsVisible === item} //
          />
        );
      }}
    />

    <Modal transparent={true} visible={modalVisible} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Czy na pewno chcesz usunąć tę prognozę?</Text>
          <TouchableOpacity onPress={handleDeleteCity}>
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
  skewedTextContainer: {
    width: '133%',
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
  iconContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
    marginLeft: 70
  },
  weatherIcon: {
    width: 77,
    height: 77,
  },
  tempText: {
    fontSize: 25,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  conditionContainer: {
    backgroundColor: '#007bff',
    width: 225,
    height: '100%',
    position: 'absolute',
    right: 0,
  },
  checkbox: {
    position: 'absolute',
    top: 10,
    right: -340,
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
  optionsIcon: {
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
    marginVertical: 2,
  },
  optionText: {
    color: 'white',
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
});

export default WeatherList;
