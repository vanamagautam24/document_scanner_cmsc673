import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Represents the props for the CustomCheckbox component.
 *
 * @interface CustomCheckboxProps
 */
interface CustomCheckboxProps {
  /**
   * The label text for the checkbox.
   */
  label: string;

  /**
   * A callback function that is called when the checkbox state changes.
   *
   * @param {boolean} checked - Indicates whether the checkbox is checked.
   */
  onCheck: (checked: boolean) => void;
}

/**
 * CustomCheckbox is a customizable checkbox component.
 *
 * @param {CustomCheckboxProps} props - The props for the CustomCheckbox component.
 * @returns {React.ReactNode} The CustomCheckbox component.
 */
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, onCheck }) => {
  /**
   * Represents the state of the checkbox (checked or unchecked).
   */
  const [isChecked, setIsChecked] = useState(false);

  /**
   * Toggles the checkbox state and calls the `onCheck` callback.
   */
  const toggleCheckbox = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onCheck(newState);
  };

  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={toggleCheckbox}>
      <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : null]}>
        {isChecked && (
          <View style={styles.checkedView}>
            {/* Add the checkmark icon or text here */}
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

/**
 * Represents the styles for the CustomCheckbox component.
 */
const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#6F86FF',
  },
  checkedView: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
  },
});

export default CustomCheckbox;
