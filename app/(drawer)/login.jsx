import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Link, router } from 'expo-router';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email && password) {
      const users = await AsyncStorage.getItem('users');
      const parsedUsers = users ? JSON.parse(users) : [];

      const user = parsedUsers.find((u) => u.email === email && u.password === password);

      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify({ email: user.email }));

        Alert.alert('Zalogowano pomyślnie');
        router.push('/(drawer)/(tabs)/start');
      } else {
        Alert.alert('Niepoprawny email lub hasło');
      }
    } else {
      Alert.alert('Wprowadź email i hasło');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Logowanie</Text>
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Icon name="envelope" size={20} color="#6e6e6e" style={styles.icon} />
          <TextInput
            placeholder="Adres email"
            placeholderTextColor="#6e6e6e"
            style={styles.input}
            onChangeText={setEmail}
            value={email}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6e6e6e" style={styles.icon} />
          <TextInput
            placeholder="Hasło"
            placeholderTextColor="#6e6e6e"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Zaloguj się</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Nie masz konta? <Link href="/register" style={styles.linkText}>Zarejestruj się</Link>
      </Text>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 26,
    color: 'white',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    color: 'white',
    flex: 1,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  footerText: {
    color: '#6e6e6e',
    marginTop: 20,
  },
  linkText: {
    color: '#007bff',
  },
});

