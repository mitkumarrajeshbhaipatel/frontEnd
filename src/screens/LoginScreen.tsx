import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator, // For loading spinner
} from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail } from '../utils/validateEmail';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Track loading state
  const navigation = useNavigation<any>();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert('Invalid Email');
      return;
    }
    if (!password) {
      Alert.alert('Password is required');
      return;
    }

    setLoading(true); // Start loading indicator
    try {
      await login(email, password);
      setLoading(false); // Stop loading
      navigation.replace('Main');
    } catch (error) {
      setLoading(false); // Stop loading
      Alert.alert('Login failed', (error as any)?.message || 'Try again');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/favicon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Welcome Back</Text>

          {/* Show loading indicator or login form */}
          {loading ? (
            <ActivityIndicator size="large" color="#6e5be0" />
          ) : (
            <>
              <Input
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
              />

              <Button title="Login" onPress={handleLogin} />

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryText}>Create an Account</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#faf6f5',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  secondaryButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6e5be0',
    textDecorationLine: 'underline',
  },
});
