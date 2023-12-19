import React from "react";

import { View, Text, StyleSheet } from "react-native";

/**
 * Files Component.
 * A React Native component for displaying files.
 *
 * @returns {import('react').ReactNode} The rendered Files component.
 */
const Files = () => {
    return (
        <View style={styles.container}>
            <Text>Files</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

export default Files;