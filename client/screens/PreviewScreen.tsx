import React from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for navigation
type RootStackParamList = {
  Home: undefined;
  PreviewScreen: { images: any[] };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const ngrokUrl = 'https://80c0-2605-ad80-20-69f3-249a-d579-e5f1-804e.ngrok.io';

type PreviewScreenProps = {
  navigation: HomeScreenNavigationProp;
  route: any;
};

// Define the PreviewScreen component
const PreviewScreen: React.FC<PreviewScreenProps> = ({ navigation, route }) => {
  const { images } = route.params;

  // Function to upload images and generate a PDF
  const uploadImagesAndGetPDF = async () => {
    const formData: any = new FormData();

    images.forEach((image: { uri: string }, index: number) => {
      formData.append('files', {
        name: `image${index}.png`, // Adjust the filename as needed
        type: 'image/png', // Adjust the MIME type as needed
        uri: image.uri,
      });
    });

    try {
      const response = await fetch(`${ngrokUrl}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Assuming the server returns the URL/path of the generated PDF
      const pdfUrl = await response.text();
      // Handle the PDF URL (e.g., download the file, display it, etc.)
      Alert.alert('PDF Created', `PDF is available at: ${pdfUrl}`);
    } catch (error) {
      console.error('Error uploading images: ', error);
      Alert.alert('Error', 'There was an issue creating the PDF.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Button to convert images to PDF */}
      <TouchableOpacity style={styles.pdfButton} onPress={uploadImagesAndGetPDF}>
        <Text style={styles.pdfButtonText}>Convert to PDF</Text>
      </TouchableOpacity>

      {/* ScrollView to display images */}
      <ScrollView contentContainerStyle={styles.imageContainer}>
        {images.map((image: { uri: string }, index: number) => (
          <Image key={index} source={{ uri: image.uri }} style={styles.image} />
        ))}
      </ScrollView>

      {/* Button to go back to the camera screen */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Back to Camera</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 300, // Adjust the width as needed
    height: 400, // Adjust the height as needed
    resizeMode: 'contain',
    marginVertical: 10,
    borderRadius: 10,
  },
  backButton: {
    padding: 10,
    margin: 20,
    backgroundColor: '#4B68FF',
    borderRadius: 5,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  pdfButton: {
    padding: 10,
    margin: 20,
    backgroundColor: '#4B68FF',
    borderRadius: 5,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PreviewScreen;
