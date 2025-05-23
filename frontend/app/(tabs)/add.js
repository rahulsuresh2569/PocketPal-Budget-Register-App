import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
// We will create this component later
// import CategoryPicker from '../../components/CategoryPicker'; 

export default function AddEntryScreen() {
  const [date, setDate] = useState(new Date()); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [debit, setDebit] = useState('0');
  const [credit, setCredit] = useState('0');

  // TODO: Fetch categories for CategoryPicker
  // TODO: Implement actual date picker (e.g., @react-native-community/datetimepicker)
  // TODO: Form validation
  // TODO: API call to create entry

  const handleAddEntry = () => {
    // Basic validation (example)
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }
    if (parseFloat(debit) < 0 || parseFloat(credit) < 0) {
      Alert.alert('Validation Error', 'Debit and Credit cannot be negative.');
      return;
    }
    if (parseFloat(debit) === 0 && parseFloat(credit) === 0) {
      Alert.alert('Validation Error', 'Either Debit or Credit must be greater than zero.');
      return;
    }

    console.log('Adding entry:', { date: date.toISOString().split('T')[0], category, subject, debit, credit });
    // Call API to create entry here
    // On success, potentially navigate back or clear form
    Alert.alert('Success', 'Entry would be added here!'); 
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.label}>Date</Text>
      {/* Placeholder for Date Picker - will be replaced */}
      <Button onPress={() => setShowDatePicker(true)} title={date.toLocaleDateString()} />
      {/* 
        {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={"date"}
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )} 
      */}

      <Text style={styles.label}>Category</Text>
      {/* <CategoryPicker selectedValue={category} onValueChange={setCategory} /> */}
      <TextInput 
        style={styles.input} 
        placeholder="Select or Type Category (temp)" 
        value={category} 
        onChangeText={setCategory} 
      />

      <Text style={styles.label}>Subject (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Description of the transaction"
        value={subject}
        onChangeText={setSubject}
      />

      <Text style={styles.label}>Debit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={debit}
        onChangeText={setDebit}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Credit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={credit}
        onChangeText={setCredit}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        <Button title="Add Entry" onPress={handleAddEntry} color="#2563eb" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37474f',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 30,
  },
}); 