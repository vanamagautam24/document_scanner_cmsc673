
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '../screens/SignInScreen/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import Premium from '../screens/Premium';
import Files from '../screens/Files';
import Account from '../screens/Account';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CameraScreen from '../screens/CameraScreen';
import PreviewScreen from '../screens/PreviewScreen';


type NavigationProps = {
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
};

/**
 * NavigationProps type represents the navigation properties.
 *
 * @typedef {object} NavigationProps
 * @property {boolean} isLoggedIn - Indicates whether the user is logged in.
 * @property {React.Dispatch<React.SetStateAction<boolean>>} setIsLoggedIn - Function to set the login status.
 */

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/**
 * HomeStackNavigator represents the stack navigator for the home-related screens.
 *
 * @returns {React.ReactNode} The home stack navigator component.
 */
const HomeStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeStack"
      component={HomeScreen}
      options={({ navigation, route }) => ({
        headerShown: false,
      })}
    />
    <Stack.Screen options={({ navigation, route }) => ({
      headerShown: false,
    })} name="Camera" component={CameraScreen} />
    <Stack.Screen options={({ navigation, route }) => ({
      headerShown: false,
    })} name="PreviewScreen" component={PreviewScreen} />
    <Stack.Screen
      name="Login"
      component={SignInScreen}
      options={({ navigation, route }) => ({
        headerShown: false,
      })}
    />
  </Stack.Navigator>
);

/**
 * MainTabNavigator represents the main bottom tab navigator.
 *
 * @returns {React.ReactNode} The main bottom tab navigator component.
 */
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarShowLabel: true,
      tabBarActiveTintColor: '#4B68FF', // Active icon color
      tabBarInactiveTintColor: '#ccc', // Inactive icon color
      headerShown: false,
      tabBarStyle: {
        backgroundColor: 'white',
        paddingBottom: 5,
        height: 60,
        borderTopColor: 'transparent',
        shadowColor: '#fff',
      },
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Premium':
            iconName = 'star';
            break;
          case 'Files':
            iconName = 'folder';
            break;
          case 'Account':
            iconName = 'person';
            break;
          default:
            iconName = 'error';
        }
        return <MaterialIcons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStackNavigator} />
    <Tab.Screen name="Files" component={Files} />
    <Tab.Screen name="Premium" component={Premium} />
    <Tab.Screen name="Account" component={Account} />
  </Tab.Navigator>
);

/**
 * Navigation represents the main navigation container.
 *
 * @param {NavigationProps} props - The navigation props.
 * @returns {React.ReactNode} The navigation container component.
 */
const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, setIsLoggedIn }) => (
  <NavigationContainer>
    <MainTabNavigator />
  </NavigationContainer>
);

export default Navigation;
