import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NavigationProp } from '@react-navigation/native';

/**
 * Represents the navigation route parameters for the Root Stack.
 *
 * @interface RootStackParamList
 */
type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Login: undefined;
};

/**
 * AppHeader is a custom header component for the application.
 *
 * @param {object} props - The props for the AppHeader component.
 * @param {NavigationProp<RootStackParamList>} props.navigation - The navigation prop for navigating to different screens.
 * @returns {React.ReactNode} The AppHeader component.
 */
const AppHeader = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContainer}>
        <Ionicons name="aperture" size={24} color="#4B68FF" /> 
        <Text style={styles.headerTitle}>ProScan</Text>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Ionicons name="log-in" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

/**
 * Represents the styles for the AppHeader component.
 */
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20, 
    backgroundColor: '#fff', 
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center', 
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold', 
    color: '#000', 
    marginLeft: 10, 
  },
});

export default AppHeader;
