import React from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import { Link } from 'expo-router'; // For navigation if needed

// Dummy data for now - will be replaced by API calls
const dummyEntries = [
  { id: '1', date: '2024-05-01', category: 'Food', subject: 'Groceries', debit: 50, credit: 0 },
  { id: '2', date: '2024-05-03', category: 'Salary', subject: 'Monthly Pay', debit: 0, credit: 2000 },
  { id: '3', date: '2024-05-05', category: 'Transport', subject: 'Bus fare', debit: 10, credit: 0 },
];

export default function EntriesScreen() {
  // TODO: Fetch entries from API
  // TODO: Implement pull-to-refresh
  // TODO: Implement loading and error states

  const renderItem = ({ item }) => (
    <View style={styles.entryItem}>
      <Text style={styles.entryDate}>{item.date}</Text>
      <Text style={styles.entryCategory}>{item.category} - {item.subject}</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.debit}>D: {item.debit.toFixed(2)}</Text>
        <Text style={styles.credit}>C: {item.credit.toFixed(2)}</Text>
      </View>
      {/* TODO: Add Edit/Delete buttons, navigate to edit screen */}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyEntries} // Replace with actual entries from state
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No entries yet. Pull to refresh or add one!</Text>}
      />
      {/* Example: Button to navigate to Add screen (though tab navigation also works) */}
      {/* <Link href="/(tabs)/add" asChild>
        <Button title="Add New Entry" />
      </Link> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f2f5',
  },
  entryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  entryDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  entryCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debit: {
    color: 'red',
    fontSize: 14,
  },
  credit: {
    color: 'green',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
}); 