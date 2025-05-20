// src/screens/ReportScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { createReport } from '../services/reportService'
const REASONS = ['Spamming', 'Harassment', 'Scam', 'Inappropriate Content', 'Other'];

const ReportScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { session } = route.params;

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Missing Reason', 'Please select a reason for your report.');
      return;
    }

    const payload = {
      session_id: session.session_id,
      reporter_id: user?.id,
      target_user_id: user?.id === session.requester_id ? session.helper_id : session.requester_id,
      reason: selectedReason,
      details: details.trim(),
    };

    try {
      // Replace this with your API call if available
      console.log('🚨 Report Payload:', payload);
      await createReport(payload);


      Alert.alert('Report Submitted', 'Thank you for helping keep the community safe.');
      navigation.goBack();
    } catch (err) {
      console.error('❌ Error submitting report:', err);
      Alert.alert('Error', 'There was a problem submitting your report. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Report a Problem</Text>
        <Text style={styles.label}>Session ID: {session.session_id}</Text>
        <Text style={styles.subheading}>Select a reason:</Text>

        {REASONS.map((reason) => (
          <TouchableOpacity
            key={reason}
            style={[
              styles.reasonButton,
              selectedReason === reason && styles.reasonButtonSelected,
            ]}
            onPress={() => setSelectedReason(reason)}
          >
            <Text
              style={[
                styles.reasonText,
                selectedReason === reason && styles.reasonTextSelected,
              ]}
            >
              {reason}
            </Text>
          </TouchableOpacity>
        ))}

        <TextInput
          placeholder="Additional details (optional)..."
          style={styles.input}
          multiline
          value={details}
          onChangeText={setDetails}
        />

        <Button title="Submit Report" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  label: {
    color: '#555',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 10,
  },
  reasonButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reasonButtonSelected: {
    backgroundColor: '#007bff22',
    borderColor: '#007bff',
  },
  reasonText: {
    fontSize: 16,
  },
  reasonTextSelected: {
    color: '#007bff',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    padding: 12,
    borderRadius: 8,
    height: 120,
    textAlignVertical: 'top',
    marginTop: 20,
    marginBottom: 20,
  },
});
