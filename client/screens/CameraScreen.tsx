import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera, CameraType } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

// Assuming you are using the '@react-navigation/stack' and '@react-navigation/native' packages
import { StackNavigationProp } from '@react-navigation/stack';
import { useIsFocused } from '@react-navigation/native';

import axios from 'axios';
import LottieView from 'lottie-react-native';
import { Alert } from 'react-native';



type RootStackParamList = {
    Home: undefined;
    PreviewScreen: { images: any[] };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

type HomeScreenProps = {
    navigation: HomeScreenNavigationProp;
};

const ngrokUrl = 'https://80c0-2605-ad80-20-69f3-249a-d579-e5f1-804e.ngrok.io';

/**
 * CameraScreen Component for capturing and processing images.
 * @param {object} props - The props for the CameraScreen component.
 * @param {object} props.navigation - The navigation object for React Navigation.
 * @returns {JSX.Element} - Returns the CameraScreen component.
 */

const CameraScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const isFocused = useIsFocused();
    const [type, setType] = React.useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();

    const [capturedImage, setCapturedImage] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);

    const [activeTabIndex, setActiveTabIndex] = React.useState(2); // Initialize with the first tab as active
    const [cornerPoints, setCornerPoints] = React.useState([]);

    const [rotation, setRotation] = React.useState(0); // Initial rotation is 0 degrees
    const [cumulativeRotation, setCumulativeRotation] = React.useState(0); // Initial rotation is 0 degrees
    const [capturedImages, setCapturedImages] = React.useState<any[]>([]); // State to store multiple images
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(null); // Index of the selected image



    const cameraRef = React.useRef<Camera>(null);
    const lottieViewRef = React.useRef<LottieView>(null);

    React.useLayoutEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: isFocused ? { display: 'none' } : {},
        });
    }, [isFocused, navigation]);

    if (!isFocused) {
        // Unmount the component when it's not focused
        return null;
    }


    if (!permission) {
        // Camera permissions are still loading
        return <View />;
    }


    if (!permission.granted) {
        // Camera permissions are not granted yet
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
            }}>
                <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        );
    }

    const handleTabPress = (index: number) => {
        // Set the active tab index when a tab is pressed
        setActiveTabIndex(index);
    };

    // Modify the styles for active and inactive tabs
    const getTabStyle = (index: number) => {
        return [
            styles.tabItem,
            activeTabIndex === index ? styles.activeTab : null,
        ];
    };

    // Mock function to mimic image capture
    const handleCapture = async () => {
        if (cameraRef.current) {
            setLoading(true);
            const photo = await cameraRef.current.takePictureAsync();
            const localUri = photo.uri;
            const filename = localUri.split('/').pop() || 'default_filename.jpg';

            // Set the captured image to display as a preview
            setCapturedImage({ uri: localUri });

            try {
                const response = await fetch(localUri);
                const blob = await response.blob();

                const formData: any = new FormData();
                formData.append('file', { uri: localUri, name: filename, type });

                // Replace with your actual Ngrok URL
                const apiUrl = `${ngrokUrl}/process-image/`;
                const apiResponse = await axios.post(apiUrl, formData, {
                    responseType: 'blob'
                });
                if (apiResponse.data) {
                    const blob = new Blob([apiResponse.data], { type: 'image/png' });
                    const imageUri = URL.createObjectURL(blob);

                    setCapturedImage({ uri: imageUri });
                }


            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOCR = async () => {
        if (capturedImage && capturedImage.uri) {
            setLoading(true);

            try {
                const localUri = capturedImage.uri;
                const filename = localUri.split('/').pop() || 'default_filename.jpg';

                const formData: any = new FormData();
                formData.append('file', { uri: localUri, name: filename, type: 'image/jpeg' });

                // Your OCR API URL
                const ocrApiUrl = `${ngrokUrl}/ocr/`;
                const ocrApiResponse = await axios.post(ocrApiUrl, formData);

                if (ocrApiResponse.data) {
                    // Update state to show OCR text
                    setCapturedImage({ uri: null, text: ocrApiResponse.data.text });
                }
            } catch (error) {
                console.error('OCR processing failed:', error);
            } finally {
                setLoading(false);
            }
        }
    };


    const handleConfirm = () => {
        let updatedImages = [...capturedImages];

        if (selectedImageIndex !== null) {
            // Replace the selected image in the array
            if (capturedImage) {
                updatedImages[selectedImageIndex] = capturedImage;
            }
        } else {
            // If no image was selected, add the new captured image to the array
            if (capturedImage) {
                updatedImages.push(capturedImage);
            }
        }

        // Update the state with the new images array
        setCapturedImages(updatedImages);

        // Reset captured image and selected image index for the next operation
        setCapturedImage(null);
        setSelectedImageIndex(null);
    };



    const handleDeleteAll = () => {
        Alert.alert(
            "Delete All Images",
            "Are you sure you want to delete all scanned images?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK",
                    onPress: () => {
                        console.log("OK Pressed, deleting images");
                        setCapturedImages([]); // Clear all images
                        setCapturedImage({}); // Clear the current image
                    }
                }
            ]
        );
    };


    const handleRetake = () => {
        setCapturedImage(null); // Reset captured image to null
    };

    const handleRotate_ = () => {
        setRotation((prevRotation) => prevRotation + 90); // Increment rotation by 90 degrees
    };

    const handlePreviewPress = () => {
        // Navigate to a new screen or open a modal to show all images
        navigation.navigate('PreviewScreen', { images: capturedImages });
    };

    const handleRotate = async () => {
        const newRotationAngle = (cumulativeRotation + 90) % 360;
        setCumulativeRotation(newRotationAngle);
        if (!capturedImage) return; // If no image is captured, do nothing

        setLoading(true);

        try {
            const formData: any = new FormData();
            formData.append('file', {
                uri: capturedImage.uri,
                type: 'image/jpeg', // or the correct mime type of your image
                name: 'image.jpg',
            });
            formData.append('angle', newRotationAngle); // Specify the rotation angle

            const rotateApiUrl = `${ngrokUrl}/rotate-image/?angle=${encodeURIComponent(newRotationAngle)}`;

            // axios post request as before
            const apiResponse = await axios.post(rotateApiUrl, formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (apiResponse.data) {
                const blob = new Blob([apiResponse.data], { type: 'image/png' });
                const imageUri = URL.createObjectURL(blob);
                setCapturedImage({ uri: imageUri });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnhancement = async () => {
        if (!capturedImage) return; // If no image is captured, do nothing

        setLoading(true);

        try {
            const formData: any = new FormData();
            formData.append('file', {
                uri: capturedImage.uri,
                type: 'image/jpeg', // Adjust according to your image type
                name: 'image.jpg',
            });

            const enhanceApiUrl = `${ngrokUrl}/enhance-image/`;
            const apiResponse = await axios.post(enhanceApiUrl, formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (apiResponse.data) {
                const blob = new Blob([apiResponse.data], { type: 'image/png' });
                const imageUri = URL.createObjectURL(blob);
                setCapturedImage({ uri: imageUri });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderLoadingIndicator = () => {
        //  make lottie animaton work in real device


        if (loading) {
            return (
                <View style={styles.loadingOverlay}>
                    <LottieView
                        ref={lottieViewRef}
                        onLayout={() => lottieViewRef.current?.play()}
                        speed={1}
                        style={{ flex: 1 }}
                        source={require('../assets/scanning.json')}
                        autoPlay
                        loop
                        resizeMode="cover"
                    />
                </View>
            );
        }
        return null;
    };

    const handlePreviewClick = (image: {
        uri: string;
        text?: string;
    }, index: any) => {
        setCapturedImage(image);
        setSelectedImageIndex(index);
    };

    const handleDeleteSelectedImage = () => {
        if (selectedImageIndex !== null) {
            let updatedImages = [...capturedImages];
            updatedImages.splice(selectedImageIndex, 1); // Remove the selected image
            setCapturedImages(updatedImages);

            // Reset captured image and selected image index
            setCapturedImage(null);
            setSelectedImageIndex(null);
        }
    };

    const handleGrayscale = async () => {
        if (!capturedImage) return; // If no image is captured, do nothing

        setLoading(true);

        try {
            const formData: any = new FormData();
            formData.append('file', {
                uri: capturedImage.uri,
                type: 'image/jpeg', // Adjust according to your image type
                name: 'image.jpg',
            });

            const enhanceApiUrl = `${ngrokUrl}/apply-grayscale/`;
            const apiResponse = await axios.post(enhanceApiUrl, formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (apiResponse.data) {
                const blob = new Blob([apiResponse.data], { type: 'image/png' });
                const imageUri = URL.createObjectURL(blob);
                setCapturedImage({ uri: imageUri });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    const handleBlackAndWhite = async () => {
        if (!capturedImage) return; // If no image is captured, do nothing

        setLoading(true);

        try {
            const formData: any = new FormData();
            formData.append('file', {
                uri: capturedImage.uri,
                type: 'image/jpeg', // Adjust according to your image type
                name: 'image.jpg',
            });

            const enhanceApiUrl = `${ngrokUrl}/apply-invert/`;
            const apiResponse = await axios.post(enhanceApiUrl, formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (apiResponse.data) {
                const blob = new Blob([apiResponse.data], { type: 'image/png' });
                const imageUri = URL.createObjectURL(blob);
                setCapturedImage({ uri: imageUri });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    const handleSepia = async () => {
        if (!capturedImage) return; // If no image is captured, do nothing

        setLoading(true);

        try {
            const formData: any = new FormData();
            formData.append('file', {
                uri: capturedImage.uri,
                type: 'image/jpeg', // Adjust according to your image type
                name: 'image.jpg',
            });

            const enhanceApiUrl = `${ngrokUrl}/apply-sepia/`;
            const apiResponse = await axios.post(enhanceApiUrl, formData, {
                responseType: 'blob',
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (apiResponse.data) {
                const blob = new Blob([apiResponse.data], { type: 'image/png' });
                const imageUri = URL.createObjectURL(blob);
                setCapturedImage({ uri: imageUri });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };



    return (
        <SafeAreaView style={styles.screenContainer}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="ios-arrow-back" size={24} color="white" />
                </TouchableOpacity>

                {/* Add rotate, retake, and enhancement icons */}
                <TouchableOpacity onPress={handleRotate}>
                    <Ionicons name="ios-refresh" size={24} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={handleRetake}>
                    <Ionicons name="ios-camera" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleEnhancement}>
                    <Ionicons name="ios-color-wand" size={24} color="white" />
                </TouchableOpacity>


                {/* Existing ellipsis icon */}
                <TouchableOpacity onPress={handleOCR}>
                    <Ionicons name="ellipsis-vertical" size={24} color="white" />
                </TouchableOpacity>
                {capturedImages.length > 0 && (<TouchableOpacity onPress={handleDeleteAll}>
                    <Ionicons name="trash" size={24} color="white" />
                </TouchableOpacity>)}
            </View>


            {capturedImages.length > 0 && (
                <TouchableOpacity style={styles.previewButton} onPress={handlePreviewPress}>
                    <Text style={styles.previewButtonText}>Preview All</Text>
                </TouchableOpacity>
            )}

            {/* Placeholder for the document/card scanning area */}
            <View style={styles.cameraWrapper}>
                {capturedImage?.uri ? (
                    // Display the captured image with the applied rotation
                    <Image
                        source={{ uri: capturedImage.uri }}
                        style={{
                            ...styles.fullScreenImage,
                            transform: [{ rotate: `${rotation}deg` }]
                        }}
                    />
                ) : capturedImage?.text ? (
                    // Display the OCR text when available
                    <Text style={{
                        ...styles.fullScreenImage,
                        color: 'white',
                        fontSize: 20,
                        textAlign: 'center',
                        textAlignVertical: 'center',

                    }}>{capturedImage.text}</Text>
                ) : (
                    // Default camera view when there's no captured image or OCR text
                    <Camera style={styles.camera} type={type} ref={cameraRef}>
                        <View style={styles.documentLayer}>
                            {/* This could be additional UI elements or overlays on the camera view */}
                        </View>
                    </Camera>
                )}
            </View>





            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabBarContainer}
                contentContainerStyle={styles.tabBarContent}
            >
                <TouchableOpacity style={getTabStyle(2)} onPress={() => handleTabPress(2)}>
                    <Text style={[styles.tabTitle, activeTabIndex === 2 ? styles.activeTabTitle : null]}>Document</Text>
                </TouchableOpacity>
            </ScrollView>

            {capturedImages.length > 0 && (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{
                        flexDirection: 'row', position: 'absolute',
                        bottom: '26%', // Adjust this value to position the ScrollView
                        left: 0,
                        right: 0,
                        marginBottom: 10,
                        paddingHorizontal: 10,
                    }}
                >
                    {capturedImages.map((image, index) => (
                        <TouchableOpacity key={index} onPress={() => handlePreviewClick(image, index)}>

                            <Image
                                source={{ uri: image?.uri }}
                                style={{ width: 50, height: 50, borderRadius: 5, marginLeft: 10 }}
                            />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {capturedImage && !loading && (
                <View style={styles.effectOptionsContainer}>
                    <TouchableOpacity style={styles.effectOption} onPress={handleGrayscale}>
                        <Text style={styles.effectOptionText}>Grayscale</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.effectOption} onPress={handleBlackAndWhite}>
                        <Text style={styles.effectOptionText}>Invert</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.effectOption} onPress={handleSepia}>
                        <Text style={styles.effectOptionText}>Sepia</Text>
                    </TouchableOpacity>
                </View>
            )}


            <View style={styles.cameraContent}>
                <View style={styles.leftIconsContainer}>
                    {capturedImage && capturedImages.length > 0 && <TouchableOpacity onPress={handleDeleteSelectedImage}>
                        <Ionicons name="trash" size={30} color="#4B68FF" />
                    </TouchableOpacity>}
                </View>
                {!capturedImage && <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>

                    <View style={styles.innerCircle} />

                </TouchableOpacity>}
                {capturedImage && (
                    <>
                        {/* Delete Button */}


                        {/* Confirm Button */}
                        <TouchableOpacity style={styles.previewImage} onPress={handleConfirm}>
                            <Ionicons name="checkmark-circle" size={50} color="#4B68FF" />
                        </TouchableOpacity>
                    </>
                )}


            </View>



            {renderLoadingIndicator()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#121212', // Dark background as in the screenshot
    },
    cameraWrapper: {
        flex: 1,
        position: 'relative',
    },
    loadingOverlay: {
        position: 'absolute',
        top: '17.5%',
        left: '5%',
        right: '5%',
        bottom: '30%',
        // borderColor: 'lightblue',
        // borderWidth: 2,
        // backgroundColor: 'rgba(173, 216, 230, 0.5)', // Light blue color with semi-transparency
    },
    effectOptionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 10,
        // position: 'absolute',
        bottom: '0%',
        left: 0,


        // backgroundColor: '#fff', // Change as needed
    },
    effectOption: {
        padding: 10,
        backgroundColor: '#f0f0f0', // Change as needed
        borderRadius: 5,
    },
    effectOptionText: {
        fontSize: 16,
        color: '#000', // Change as needed
    },
    documentLayer: {
        position: 'absolute',
        top: '5%',
        left: '5%',
        right: '5%',
        bottom: '5%',
        borderColor: 'lightblue',
        borderWidth: 2,
        backgroundColor: 'rgba(173, 216, 230, 0.5)', // Light blue color with semi-transparency
    },
    fullScreenImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    documentImage: {
        flex: 1, // Take up all available space in the container
        resizeMode: 'contain', // Maintain aspect ratio
        width: '100%', // Full width of the container
        height: '100%', // Full height of the container
        borderColor: 'lightblue',
        borderWidth: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#000', // Dark header background
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // Additional styling if necessary
    },
    placeholderImage: {
        width: '90%', // Adjust width according to your design
        height: '50%', // Adjust height according to your design
        resizeMode: 'contain',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        marginBottom: 10,
        backgroundColor: '#1A1A1A', // Dark tab bar background
    },

    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    cameraContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 30,
    },
    leftIconsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        justifyContent: 'space-between',
        width: '25%',
        left: 30,
        // top: '20%',
        transform: [{ translateY: -20 }], // Adjust this to center vertically
    },
    captureButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
    },
    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#000',
    },
    previewImage: {
        position: 'absolute',
        right: 0,
        width: 75,
        height: 75,
        borderRadius: 10,
    },

    deleteButton: {
        position: 'absolute',
        right: 60,
        width: 75,
        height: 75,
        borderRadius: 10,
    },


    galleryIcon: {
        backgroundColor: 'rgba(192, 192, 192, 1)', // Grayish background color
        borderRadius: 20, // Rounded corners
        padding: 10,
        shadowColor: 'black', // Shadow color
        shadowOpacity: 0.5, // Shadow opacity
        shadowOffset: { width: 2, height: 2 }, // Shadow offset
        shadowRadius: 4, // Shadow radius
    },
    centerContent: {
        flexDirection: 'row', // Place the inner circle and captured image in the same row
        alignItems: 'center',
    },

    centerCircleContainer: {
        flex: 1, // Takes remaining space in the center
        alignItems: 'center', // Center the inner circle and captured image horizontally
    },

    loadingIndicator: {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: [{ translateX: -24 }, { translateY: -24 }], // Half the size of the icon to center
    },

    // loadingOverlay: {
    //     position: 'absolute',
    //     left: 0,
    //     right: 0,
    //     top: 0,
    //     bottom: 0,
    //     justifyContent: 'center',
    //     alignItems: 'center',
    //     backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
    // },
    // Modify the styles for tabBarContainer and tabItem as follows:
    tabBarContainer: {
        backgroundColor: '#1A1A1A', // Dark tab bar background
        paddingHorizontal: 20,
        flexDirection: 'row', // Set flexDirection to 'row' to align items horizontally
        maxHeight: 30,


    },
    tabItem: {
        alignItems: 'center',
        marginRight: 50,
        borderTopWidth: 2,
        borderTopColor: 'transparent',
        paddingBottom: 10,
    },

    tabBarContent: {
        paddingHorizontal: 10, // Horizontal padding to keep the tabs from touching the edges
        paddingVertical: 2, // Minimal vertical padding around the text
        alignItems: 'center',
        justifyContent: 'space-between',
        // width: '100%',
    },
    activeTab: {
        backgroundColor: '#1A1A1A',
        borderTopColor: '#4B68FF', // Add this line to set the color of the border
        borderTopWidth: 3, // Add this line to make the border visible
        borderRadius: 5,
    },

    activeTabIndicator: {

    },
    tabTitle: {
        color: 'white',
        fontSize: 12,
    },
    activeTabTitle: {
        color: '#4B68FF',
        fontWeight: 'bold',
    },
    previewButton: {
        backgroundColor: '#4B68FF', // Adjust the color as needed
        padding: 10,
        borderRadius: 5,
        margin: 20,
        alignItems: 'center',
    },

    previewButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default CameraScreen;
