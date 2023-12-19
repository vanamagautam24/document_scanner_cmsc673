import React from "react";

import { View, Text, StyleSheet } from "react-native";

/**
 * CameraScreen Component for capturing and processing images.
 * @param {object} props - The props for the CameraScreen component.
 * @param {object} props.navigation - The navigation object for React Navigation.
 * @returns {JSX.Element} - Returns the CameraScreen component.
 */
const Account = () => {
    return (
        <View style={styles.container}>
            <Text>Account</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

export default Account;