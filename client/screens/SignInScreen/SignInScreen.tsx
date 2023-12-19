import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'; // Import KeyboardAvoidingView
import styles from './signin';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CustomCheckbox from '../../components/Checkbox/Checkbox';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HorizontalLine from '../../components/HorizontalLine';
import HorizontalLinesWithText from '../../components/HorizontalLinesWithText';
import axios from 'axios';
import { NavigationProp } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';


type RootStackParamList = {
  HomeStack: undefined;
  Camera: undefined;
};

const ngrokUrl = 'https://80c0-2605-ad80-20-69f3-249a-d579-e5f1-804e.ngrok.io';

/**
 * @typedef {object} RootStackParamList - The navigation parameter list for the root stack.
 * @property {undefined} HomeStack - Represents the HomeStack navigation route.
 * @property {undefined} Camera - Represents the Camera navigation route.
 */

/**
 * SignInScreen Component
 *
 * This component represents the Sign-In screen.
 *
 * @param {Object} props - The component props.
 * @param {NavigationProp<RootStackParamList>} props.navigation - The navigation object for the Sign-In screen.
 * @returns {React.ReactNode} The Sign-In screen component.
 */

const SignInScreen = ({ navigation }: { navigation: NavigationProp<RootStackParamList> }) => {
  const isFocused = useIsFocused();
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [email, setEmail] = React.useState('joe@example.com');
  const [password, setPassword] = React.useState('secret_new');

  React.useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
        tabBarStyle: isFocused ? { display: 'none' } : {},
    });
}, [isFocused, navigation]);


  /**
   * Handle checkbox change event.
   *
   * @param {boolean} checked - Indicates whether the checkbox is checked.
   */
  const handleCheckboxChange = (checked: boolean) => {
    console.log('Checkbox is now:', checked);
  };

   /**
   * Handle the sign-in action.
   */
  const handleSignIn = async () => {
    try {
      const response = await axios.post(`{ngrokUrl}/login/`, {
        email: email,
        password: password,
      });

      console.log('Login response:', response.data);

      // Save the token (consider using SecureStore or AsyncStorage)
      // For example: await AsyncStorage.setItem('token', response.data.token);

      navigation.navigate('HomeStack'); // Navigate to Home Screen
    } catch (error: any) {
      console.error('Login failed:', error.response?.data?.detail || error.message);
      // Handle error (show message to user, etc.)
    }
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1, paddingHorizontal: '5%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
      >
        <View style={styles.headerContainer}>
          <View style={styles.backButtonContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="return-up-back-sharp" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <Text style={styles.headerText}>Hello there 👋</Text>
          <Text style={styles.subHeaderText}>Please enter your email & password to sign in.</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            placeholder="Email"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.inputLabel}>Password</Text>
          <View>
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={24}
                color="#6F86FF"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.rememberMeContainer}>
            <CustomCheckbox label="Remember me" onCheck={handleCheckboxChange} />
          </TouchableOpacity>
        </View>

        <HorizontalLine />

        <Text style={styles.forgotPasswordText}>Forgot Password</Text>

        <HorizontalLinesWithText text="or continue with" />

        <View style={styles.socialLoginContainer}>
          <View style={styles.iconContainer}>
            <FontAwesome name="google" size={24} color="#6F86FF" />
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="apple" size={24} color="#6F86FF" />
          </View>
          <View style={styles.iconContainer}>
            <FontAwesome name="facebook" size={24} color="#6F86FF" />
          </View>
        </View>

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignInScreen;
