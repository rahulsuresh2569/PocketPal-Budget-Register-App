import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useBudget } from '../store/BudgetContext';

const NEW_SUBJECT_VALUE = '__NEW_SUBJECT__';

const SubjectPicker = ({ categoryId, selectedValue, onValueChange, style, enabled = true }) => {
  const { subjects: contextSubjects, fetchSubjectsByCategoryId, addSubject, loading: budgetLoading } = useBudget();
  const [localSubjects, setLocalSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSubjects = useCallback(async () => {
    if (categoryId) {
      setIsLoading(true);
      // fetchSubjectsByCategoryId from context now returns the subjects
      const fetchedSubjects = await fetchSubjectsByCategoryId(categoryId);
      setLocalSubjects(fetchedSubjects || []);
      setIsLoading(false);
    } else {
      setLocalSubjects([]); // Clear subjects if no category is selected
    }
  }, [categoryId, fetchSubjectsByCategoryId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]); // Reload subjects when categoryId changes

  const handleValueChange = async (itemValue, itemIndex) => {
    if (itemValue === NEW_SUBJECT_VALUE) {
      if (!categoryId) {
        Alert.alert("Error", "Please select a category first before adding a subject.");
        onValueChange(selectedValue); // Revert
        return;
      }
      Alert.prompt(
        'Add New Subject',
        'Enter the name for the new subject:',
        async (newSubjectName) => {
          if (newSubjectName && newSubjectName.trim() !== '') {
            const newSubject = await addSubject(newSubjectName.trim(), categoryId);
            if (newSubject && newSubject._id) {
              onValueChange(newSubject._id);
              await loadSubjects(); // Refresh subjects list after adding
            } else {
              onValueChange(selectedValue); // Revert
            }
          } else {
            onValueChange(selectedValue); // Revert
          }
        },
        'plain-text',
        ''
      );
    } else {
      onValueChange(itemValue);
    }
  };

  const pickerItems = [
    { label: categoryId ? 'Select Subject...' : 'Select Category First', value: '' },
    ...localSubjects.map(sub => ({ label: sub.name, value: sub._id })),
    { label: 'Add New Subject...', value: NEW_SUBJECT_VALUE }
  ];
  
  // The main loading state for the picker (e.g., when categoryId changes)
  if (isLoading) {
    return <Text style={styles.loadingText}>Loading subjects...</Text>;
  }

  return (
    <View style={[styles.pickerContainer, style, !enabled && styles.disabledPickerContainer]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
        style={styles.picker}
        enabled={enabled && categoryId}
        prompt="Select a Subject"
      >
        {pickerItems.map((item) => (
          <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    backgroundColor: '#fff',
    marginBottom: 10,
    justifyContent: 'center',
  },
  disabledPickerContainer: {
    backgroundColor: '#e9ecef', // A slightly different background for disabled state
    opacity: 0.7,
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
  },
  loadingText: {
    paddingVertical: 15,
    textAlign: 'center',
    color: '#777'
  }
});

export default SubjectPicker; 