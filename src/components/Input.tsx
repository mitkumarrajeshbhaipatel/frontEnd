import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
}

const Input = ({ label, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput {...props} style={styles.input} placeholderTextColor="#aaa" />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: 15, width: '100%' },
  label: { marginBottom: 5, fontSize: 14, color: '#555' },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
});
