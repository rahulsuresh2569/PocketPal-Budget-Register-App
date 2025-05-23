import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useBudget } from '../../store/BudgetContext';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import CategoryPicker from '../../components/CategoryPicker';
import SubjectPicker from '../../components/SubjectPicker';

const initialFormState = {
  date: new Date(),
  categoryId: '', // Will now be set by CategoryPicker
  subjectId: '',  // Will now be set by SubjectPicker
  subjectDescription: '', // For optional notes
  debit: '', // Changed from '0' to ''
  credit: '', // Changed from '0' to ''
};

export default function AddEntryScreen() {
  const { addEntry, loading: budgetLoading } = useBudget();
  const router = useRouter();

  const [formState, setFormState] = useState(initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (name, value) => {
    // For numeric fields, allow empty string or valid numbers
    if (name === 'debit' || name === 'credit') {
      if (value === '' || /^[0-9]*\.?\d*$/.test(value)) { // Allow empty, numbers, or decimal
        setFormState(prevState => ({ ...prevState, [name]: value }));
      } else {
        // Optionally, revert to previous value or do nothing if input is invalid
        // For now, this will prevent non-numeric input beyond the initial characters
      }
    } else if (name === 'categoryId') {
      setFormState(prevState => ({ 
        ...prevState, 
        [name]: value,
        subjectId: '' 
      }));
    } else {
      setFormState(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormState(initialFormState);
  };

  const handleAddEntry = async () => {
    if (!formState.categoryId) {
      Alert.alert('Validation Error', 'Please select a category.');
      return;
    }
    if (!formState.subjectId) {
      Alert.alert('Validation Error', 'Please select a subject.');
      return;
    }
    // Parse debit and credit, defaulting to 0 if empty or invalid
    const debitNum = parseFloat(formState.debit) || 0;
    const creditNum = parseFloat(formState.credit) || 0;

    if (debitNum < 0 || creditNum < 0) {
      Alert.alert('Validation Error', 'Debit and Credit cannot be negative.');
      return;
    }
    if (debitNum === 0 && creditNum === 0) {
      Alert.alert('Validation Error', 'Either Debit or Credit must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    const entryData = {
      date: formState.date.toISOString().split('T')[0],
      categoryId: formState.categoryId,
      subjectId: formState.subjectId,
      debit: debitNum, // Send the numeric value
      credit: creditNum, // Send the numeric value
    };
    
    const success = await addEntry(entryData);
    setIsSubmitting(false);

    if (success) {
      Alert.alert('Success', 'Entry added successfully!');
      resetForm();
      router.push('/(tabs)');
    } 
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) { 
        handleInputChange('date', selectedDate);
    }
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
        <Text style={styles.dateText}>{formState.date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={formState.date}
          mode={"date"}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <Text style={styles.label}>Category</Text>
      <CategoryPicker
        selectedValue={formState.categoryId}
        onValueChange={(value) => handleInputChange('categoryId', value)}
      />

      <Text style={styles.label}>Subject</Text>
      <SubjectPicker
        categoryId={formState.categoryId} // Pass selected categoryId
        selectedValue={formState.subjectId}
        onValueChange={(value) => handleInputChange('subjectId', value)}
        enabled={!!formState.categoryId} // Enable only if a category is selected
      />

      <Text style={styles.label}>Transaction Notes/Details (Optional)</Text>
       <TextInput
        style={styles.input}
        placeholder="Optional notes for the transaction"
        value={formState.subjectDescription}
        onChangeText={(text) => handleInputChange('subjectDescription', text)}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Debit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00" // Placeholder instead of value='0'
        value={formState.debit} // Value is now controlled, can be ''
        onChangeText={(text) => handleInputChange('debit', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Credit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00" // Placeholder instead of value='0'
        value={formState.credit} // Value is now controlled, can be ''
        onChangeText={(text) => handleInputChange('credit', text)}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        {isSubmitting || budgetLoading ? (
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <Button title="Add Entry" onPress={handleAddEntry} color="#2563eb" />
        )}
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
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    fontSize: 16,
    marginBottom: 10,
    textAlignVertical: 'top', // For multiline TextInput
  },
  dateDisplay: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 30,
  },
}); 