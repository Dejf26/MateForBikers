import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { router, Link } from 'expo-router';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (email && password && confirmPassword) {
      if (password !== confirmPassword) {
        Alert.alert('Hasła nie pasują do siebie');
        return;
      }

      const existingUsers = await AsyncStorage.getItem('users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userExists = users.find((user) => user.email === email);
      if (userExists) {
        Alert.alert('Użytkownik już istnieje');
        return;
      }

      const newUser = { email, password };
      users.push(newUser);
      await AsyncStorage.setItem('users', JSON.stringify(users));

      Alert.alert('Rejestracja zakończona sukcesem');
      router.push('/login');
    } else {
      Alert.alert('Wprowadź email oraz hasła');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Rejestracja</Text>
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
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={20} color="#6e6e6e" style={styles.icon} />
          <TextInput
            placeholder="Powtórz hasło"
            placeholderTextColor="#6e6e6e"
            secureTextEntry
            style={styles.input}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
          />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Zarejestruj się</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Masz już konto? <Link href="/login" style={styles.linkText}>Zaloguj się</Link>
      </Text>
    </View>
  );
};

export default Register;

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
