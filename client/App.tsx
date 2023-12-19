import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Navigation from './navigation/Navigation';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if the user is logged in by reading a value from AsyncStorage
        const userLoggedIn = await AsyncStorage.getItem('userLoggedIn');

        // Update the state based on the value retrieved from AsyncStorage
        if (userLoggedIn === 'true') {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error reading login status:', error);
      }
    };

    // Call the checkLoginStatus function when the component mounts
    checkLoginStatus();
  }, []);

  return (
    <View style={styles.container}>
      {/* Display the app's status bar */}
      <StatusBar style="auto" />

      {/* Render the navigation component */}
      <Navigation isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

/*
This code defines a React Native application component.
It checks the user's login status by reading a value from AsyncStorage and updates the app state accordingly.
The main component renders a status bar and a navigation component based on the user's login status.

Usage:
1. Import necessary modules such as React, StatusBar, StyleSheet, View, AsyncStorage, and Navigation.
2. Define the main App component as a function that returns the app's UI.
3. Use React.useState to manage the isLoggedIn state, which tracks the user's login status.
4. Use React.useEffect to asynchronously check the login status when the component mounts.
5. Inside the checkLoginStatus function, read the userLoggedIn value from AsyncStorage.
6. Update the isLoggedIn state based on the retrieved value.
7. Render the app's status bar and the navigation component within a View.
8. Export the App component as the default export.

Note:
- AsyncStorage is used to store and retrieve data asynchronously on the device.
- The code initializes the login status based on the value stored in AsyncStorage.
- The Navigation component is assumed to handle the app's navigation based on the user's login status.
*/
