import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/pl'; 

const apiKey = '27bb4bc7c58ad4562286aded0cb8e50b';

moment.locale('pl');

const WeatherDetails = () => {
  const [groupedForecastData, setGroupedForecastData] = useState({});
  const route = useRoute();
  const { city } = route.params;

  useEffect(() => {
    fetchForecastData();
  }, [city]);

  const fetchForecastData = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
      );
      const data = await response.json();

      if (data && data.list) {
        const today = moment().startOf('day');
        const fiveDaysFromNow = today.clone().add(4, 'days');

        const filteredData = data.list.filter((item) => {
          const itemDate = moment(item.dt_txt);
          return itemDate.isBetween(today, fiveDaysFromNow, 'days', '[]');
        });

        const groupedData = filteredData.reduce((acc, item) => {
          const date = moment(item.dt_txt).format('YYYY-MM-DD');
          if (!acc[date]) acc[date] = [];
          acc[date].push(item);
          return acc;
        }, {});

        setGroupedForecastData(groupedData);
      }
    } catch (error) {
      console.error('Error fetching 5-day forecast:', error);
    }
  };

  const renderHourlyForecast = (hourData) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourText}>{moment(hourData.dt_txt).format('HH:mm')}</Text>
      <Image
        source={{ uri: `https://openweathermap.org/img/w/${hourData.weather[0].icon}.png` }}
        style={styles.weatherIcon}
      />
      <Text style={styles.tempText}>{hourData.main.temp.toFixed(0)}°C</Text>
    </View>
  );

  const renderDailyForecast = ({ item: [date, hours] }) => {
    const dayOfWeek = moment(date).format('dddd'); 
    const formattedDate = moment(date).format('DD MMMM YYYY');
  
    const rows = [];
    for (let i = 0; i < hours.length; i += 4) {
      rows.push(hours.slice(i, i + 4));
    }
  
    return (
      <View style={styles.dailyTileContainer}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{dayOfWeek}, {formattedDate}</Text>
        </View>
        {rows.map((row, index) => (
          <View key={`${date}-${index}`} style={styles.hourlyRow}> 
            {row.map((hour) => (
              <View key={hour.dt_txt}> 
                {renderHourlyForecast(hour)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.cityText}>Prognoza na najbliższe 5 dni dla {city}</Text>
      <FlatList
        data={Object.entries(groupedForecastData).slice(0, 5)}
        renderItem={renderDailyForecast}
        keyExtractor={([date]) => date}
        contentContainerStyle={styles.dailyListContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  cityText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  dailyTileContainer: {
    backgroundColor: '#2D2F33',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 10,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hourlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    width: 60,
  },
  hourText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 8
  },
  tempText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weatherIcon: {
    width: 40,
    height: 40,
    margin: -7
  },
  dailyListContent: {
    paddingBottom: 20,
  },
});

export default WeatherDetails;
