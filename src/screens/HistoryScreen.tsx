import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const historyData = [
    {
      id: '1',
      date: 'March 23',
      action: 'You send a request',
      location: 'Queens Street',
      type: 'Photo',
      user: 'Amily',
      rating: 'You rate her 4.5',
    },
    {
      id: '2',
      date: 'March 27',
      action: 'You complete a request',
      location: 'Queens Street',
      type: 'Photo',
      user: 'Mike',
      rating: 'Mike rate you 4.9',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle-outline" size={36} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History</Text>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {['All', 'As Requester', 'As Receiver'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History List */}
        {historyData.map((item) => (
          <View key={item.id} style={styles.historyCard}>
            <Text style={styles.dateText}>{item.date}  {item.action}</Text>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={20} color="#000" />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="file-text" size={20} color="#000" />
              <Text style={styles.infoText}>{item.type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="user" size={20} color="#000" />
              <Text style={styles.infoText}>{item.user}</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="checkmark-done-circle" size={20} color="#6e5be0" />
              <Text style={[styles.infoText, { color: '#6e5be0' }]}>{item.rating}</Text>
            </View>

            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Bottom Summary */}
        <View style={styles.divider} />
        <Text style={styles.summaryText}>Total Session: 21 | Average Ratings: 4.7</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf6f5' },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', marginLeft: 10, color: '#000' },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  filterButton: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#d9d9ff',
    borderColor: '#6e5be0',
  },
  filterButtonText: { fontSize: 14, color: '#666' },
  filterButtonTextActive: { color: '#4e4c9a', fontWeight: '600' },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#000',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    color: '#333',
  },
  viewButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  viewButtonText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#aaa',
    marginVertical: 20,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#000',
  },
});
