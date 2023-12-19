import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * HorizontalLinesWithText is a custom component that displays horizontal lines with text in between.
 *
 * @param {object} props - The component's properties.
 * @param {string} props.text - The text to display between the horizontal lines.
 * @returns {React.ReactNode} The HorizontalLinesWithText component.
 */
const HorizontalLinesWithText = ({ text }: {
  text: string
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.horizontalLine}></View>
      <Text style={styles.orText}>{text}</Text>
      <View style={styles.horizontalLine}></View>
    </View>
  );
};

/**
 * Represents the styles for the HorizontalLinesWithText component.
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  horizontalLine: {
    flex: 1,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    marginHorizontal: 10,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});

export default HorizontalLinesWithText;
