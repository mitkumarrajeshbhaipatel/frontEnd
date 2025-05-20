import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Simulate a delay (e.g., data fetching or loading)
    setTimeout(() => {
      navigation.replace('Login');  // Redirect to the login screen or home screen
    }, 3000);  // Delay for 3 seconds
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/favicon.png')} // Add your logo image to assets
        style={styles.logo}
      />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
