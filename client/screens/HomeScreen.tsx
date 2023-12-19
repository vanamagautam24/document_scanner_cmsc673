import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppHeader from '../components/AppHeader';
import HorizontalLine from '../components/HorizontalLine';
import RecentFilesList from '../components/RecentFilesList';

type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};


const recentFiles = [
  {
    id: '1',
    title: 'Job Application Letter',
    timestamp: '12/30/2023 09:41',
    thumbnail: require('./../assets/document_1.jpg'), // Replace with your image paths
  },
  {
    id: '2',
    title: 'Requirements Document',
    timestamp: '12/29/2023 10:20',
    thumbnail: require('./../assets/document_2.jpg'),
  },
  {
    id: '3',
    title: 'Job Application Letter',
    timestamp: '12/30/2023 09:41',
    thumbnail: require('./../assets/document_3.jpg'), // Replace with your image paths
  },
];


const toolItems = [
  { name: 'Scan Code', icon: 'qr-code-scanner', backgroundColor: 'rgba(255, 243, 224, 1)', iconColor: '#FFC107' },
  { name: 'Watermark', icon: 'branding-watermark', backgroundColor: 'rgba(255, 185, 163, 0.2)', iconColor: '#FF5722' },
  { name: 'eSign PDF', icon: 'edit', backgroundColor: 'rgba(233, 30, 99, 0.1)', iconColor: '#E91E63' },
  { name: 'Split PDF', icon: 'call-split', backgroundColor: 'rgba(156, 39, 176, 0.1)', iconColor: '#9C27B0' },
  { name: 'Merge PDF', icon: 'merge-type', backgroundColor: 'rgba(255, 87, 34, 0.1)', iconColor: '#FF5722' },
  { name: 'Protect PDF', icon: 'lock', backgroundColor: 'rgba(76, 175, 80, 0.1)', iconColor: '#4CAF50' },
  { name: 'Compress', icon: 'compress', backgroundColor: 'rgba(255, 243, 224, 1)', iconColor: '#FFC107' },
  { name: 'All Tools', icon: 'dashboard', backgroundColor: 'rgba(75, 104, 255, 0.1)', iconColor: '#4B68FF' },
];

// ToolItem component
const ToolItem = ({ iconName, toolName, backgroundColor, iconColor }: {
  iconName: string;
  toolName: string;
  backgroundColor: string;
  iconColor: string;
}) => (
  <View style={styles.toolItemContainer}>
    <TouchableOpacity style={[styles.toolButton, { backgroundColor }]}>
      <MaterialIcons name={iconName} size={24} color={iconColor} />
    </TouchableOpacity>
    <Text style={styles.toolText}>{toolName}</Text>
  </View>
);

/**
 * Home Screen Component.
 * A React Native screen for the home page.
 *
 * @typedef {Object} RootStackParamList - The root stack parameter list.
 * @property {undefined} Home - The Home screen.
 * @property {undefined} Camera - The Camera screen.
 * @property {undefined} Login - The Login screen.
 *
 * @typedef {import('@react-navigation/stack').StackNavigationProp<RootStackParamList, 'Home'>} HomeScreenNavigationProp - Navigation prop for the Home screen.
 *
 * @param {Object} props - React component props.
 * @param {HomeScreenNavigationProp} props.navigation - Navigation prop for the Home screen.
 *
 * @returns {import('react').ReactNode} The rendered Home Screen component.
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <AppHeader navigation={navigation} />
      {/* <ScrollView> */}
        <FlatList
          showsVerticalScrollIndicator={false}
          data={toolItems}
          renderItem={({ item }) => (
            <ToolItem
              iconName={item.icon}
              toolName={item.name}
              backgroundColor={item.backgroundColor}
              iconColor={item.iconColor}
            />
          )}
          keyExtractor={(item) => item.name}
          numColumns={4} // Display 4 items in one row
          scrollEnabled={false} // Disable scrolling
        />
        <HorizontalLine />
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text style={styles.sectionTitle}>Recent Files</Text>
        <MaterialIcons name="arrow-right-alt" size={24} color="#4B68FF" />
      </View>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.recentFilesContainer}>
          <RecentFilesList recentFiles={recentFiles} />
        </ScrollView>
      {/* </ScrollView> */}
      {/* Floating Action Buttons */}
      <View style={styles.floatingContainer}>
      <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Camera')}>
        <MaterialIcons name="photo-camera" size={20} color="#fff" />
      </TouchableOpacity>

        <TouchableOpacity style={[styles.floatingButton, { marginLeft: 20 }]} onPress={() => { /* Handle gallery press */ }}>
          <MaterialIcons name="photo-library" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 44 : 20, // Adjust paddingTop for iOS status bar
    paddingHorizontal: 20,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: '3%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginLeft: 20,
  },
  floatingButton: {
    width: '12%',
    aspectRatio: 1,
    borderRadius: 50,
    backgroundColor: '#4B68FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolItemContainer: {
    alignItems: 'center',
    marginVertical: 10,
    width: '25%',
  },
  recentFilesContainer: {
    maxHeight: '50%',
  },
  toolButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolText: {
    marginTop: 8,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    // marginBottom: 10,
  },
});


export default HomeScreen;