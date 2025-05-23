import React, { useState, useEffect, useCallback } from 'react';
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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useBudget } from '../../store/BudgetContext'; // Adjusted path
import DateTimePicker from '@react-native-community/datetimepicker';
import CategoryPicker from '../../components/CategoryPicker'; // Adjusted path
import SubjectPicker from '../../components/SubjectPicker';   // Adjusted path

const EditEntryScreen = () => {
  const { id: entryId } = useLocalSearchParams(); // Get entryId from route params
  const {
    fetchEntryById,
    updateExistingEntry,
    // categories, // No longer needed directly, CategoryPicker handles its own data
    // fetchSubjectsByCategoryId, // No longer needed directly, SubjectPicker handles its own data
    loading: budgetLoading, // This is for overall context loading (e.g. during update)
    error: budgetError
  } = useBudget();
  const router = useRouter();

  const [formState, setFormState] = useState(null); // Initialize as null until entry is loaded
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [initialLoadDone, setInitialLoadDone] = useState(false); // Removed

  useEffect(() => {
    const loadEntry = async () => {
      if (entryId) {
        setIsSubmitting(true); // Use isSubmitting to show loading for entry fetch
        const entryData = await fetchEntryById(entryId);
        setIsSubmitting(false);
        if (entryData) {
          setFormState({
            date: new Date(entryData.date),
            categoryId: entryData.category?._id || '',
            subjectId: entryData.subject?._id || '',
            debit: entryData.debit.toString(),
            credit: entryData.credit.toString(),
            // subjectDescription: entryData.subjectDescription || '' // If you add this field later
          });
        } else {
          Alert.alert("Error", "Could not load entry data. It may have been deleted.");
          router.back();
        }
      }
    };
    loadEntry();
  }, [entryId, fetchEntryById]); // fetchEntryById is stable due to useCallback

  // Removed the useEffect for fetchSubjectsByCategoryId and initialLoadDone

  const handleInputChange = (name, value) => {
    setFormState(prevState => {
      const newState = { ...prevState, [name]: value };
      if (name === 'debit' || name === 'credit') {
        if (value === '' || /^[0-9]*\.?\d*$/.test(value)) {
          // No change needed here, just assign
        } else {
          return prevState; // Or handle invalid input as preferred
        }
      } else if (name === 'categoryId') {
        newState.subjectId = '';
      }
      return newState;
    });
  };

  const handleUpdateEntry = async () => {
    if (!formState || !formState.categoryId || !formState.subjectId) {
      Alert.alert('Validation Error', 'Category and Subject are required.');
      return;
    }
    const debitNum = parseFloat(formState.debit) || 0;
    const creditNum = parseFloat(formState.credit) || 0;

    if (debitNum < 0 || creditNum < 0) { // isNaN check is implicitly covered by || 0
      Alert.alert('Validation Error', 'Debit and Credit must be non-negative numbers.');
      return;
    }
    if (debitNum === 0 && creditNum === 0) {
      Alert.alert('Validation Error', 'Either Debit or Credit must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    const entryDataToUpdate = {
      date: formState.date.toISOString().split('T')[0],
      categoryId: formState.categoryId,
      subjectId: formState.subjectId,
      debit: debitNum,
      credit: creditNum,
    };

    const success = await updateExistingEntry(entryId, entryDataToUpdate);
    setIsSubmitting(false);

    if (success) {
      Alert.alert('Success', 'Entry updated successfully!');
      router.back();
    } 
    // Error is handled by context
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      handleInputChange('date', selectedDate);
    }
    if(Platform.OS === 'android'){
        setShowDatePicker(false);
    }
  };

  // Show loading if form is not yet populated (entry loading) OR if an update is in progress.
  if (!formState || (budgetLoading && isSubmitting)) { 
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>{!formState ? 'Loading entry details...' : 'Updating entry...'}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: 'Edit Entry' }} />

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateDisplay}>
        <Text style={styles.dateText}>{formState.date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
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
        categoryId={formState.categoryId} 
        selectedValue={formState.subjectId}
        onValueChange={(value) => handleInputChange('subjectId', value)}
        enabled={!!formState.categoryId} // Enable only if a category is selected
      />

      <Text style={styles.label}>Debit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={formState.debit}
        onChangeText={(text) => handleInputChange('debit', text)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Credit Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        value={formState.credit}
        onChangeText={(text) => handleInputChange('credit', text)}
        keyboardType="numeric"
      />

      <View style={styles.buttonContainer}>
        {isSubmitting ? ( // isSubmitting now covers both initial load and update submission
          <ActivityIndicator size="large" color="#2563eb" />
        ) : (
          <Button title="Update Entry" onPress={handleUpdateEntry} color="#2563eb" />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 20,
  },
  centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
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

export default EditEntryScreen; 