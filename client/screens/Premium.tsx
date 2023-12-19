import React from "react";

import { View, Text, StyleSheet } from "react-native";


/**
 * Premium Component.
 * A React component for displaying premium content.
 *
 * @returns {import('react').ReactNode} The rendered Premium component.
 */
const Premium = () => {
    return (
        <View style={styles.container}>
            <Text>Premium</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});

export default Premium;