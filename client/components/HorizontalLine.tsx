import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * HorizontalLine is a custom component that renders a horizontal line.
 *
 * @returns {React.ReactNode} The HorizontalLine component.
 */
const HorizontalLine = () => {
  return (
    <View style={styles.horizontalLine}></View>
  );
};

/**
 * Represents the styles for the HorizontalLine component.
 */
const styles = StyleSheet.create({
  horizontalLine: {
    borderBottomColor: '#eee', 
    borderBottomWidth: 1,       
    marginVertical: 10,         
  },
});

export default HorizontalLine;
