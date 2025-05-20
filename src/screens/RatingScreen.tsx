// src/screens/RatingScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submitReview } from '../services/reviewService';

const RatingScreen = ({ route, navigation }: any) => {
  const { session_id, reviewer_id, target_user_id } = route.params;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async () => {
    if (!rating || !comment) {
      Alert.alert('Validation', 'Please provide rating and comment.');
      return;
    }

    const reviewData = {
      session_id,
      reviewer_id,
      target_user_id,
      rating,
      comment,
    };

    try {
      await submitReview(reviewData);
      Alert.alert('Success', 'Thank you for your feedback!');
      navigation.goBack();
    } catch (error) {
      console.error('Review submission error:', error);
      Alert.alert('Error', 'Could not submit review. Please try again.');
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} onPress={() => setRating(value)}>
            <Ionicons
              name={value <= rating ? 'star' : 'star-outline'}
              size={32}
              color={value <= rating ? '#6e5be0' : '#bbb'}
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back-circle-outline" size={36} color="#000" />
            </TouchableOpacity>
            <Text style={styles.title}>Rate the Session</Text>
          </View>

          <Text style={styles.label}>Your Rating</Text>
          {renderStars()}

          <Text style={styles.label}>Comment</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your experience..."
            multiline
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit Rating</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RatingScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#000' },
  textArea: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 30,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 30,
    justifyContent: 'space-evenly',
  },
  starIcon: {
    marginHorizontal: 5,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
