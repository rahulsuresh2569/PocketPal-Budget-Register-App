import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useBudget } from '../store/BudgetContext';
import InputModal from './InputModal';

const NEW_SUBJECT_VALUE = '__NEW_SUBJECT__';

const SubjectPicker = ({ categoryId, selectedValue, onValueChange, style, enabled = true }) => {
  const { subjects: contextSubjects, fetchSubjectsByCategoryId, addSubject, loading: budgetLoading } = useBudget();
  const [localSubjects, setLocalSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadSubjects = useCallback(async () => {
    if (categoryId) {
      setLocalSubjects([]);
      setIsLoading(true);
      const fetchedSubjects = await fetchSubjectsByCategoryId(categoryId);
      setLocalSubjects(fetchedSubjects || []);
      setIsLoading(false);
    } else {
      setLocalSubjects([]);
    }
  }, [categoryId, fetchSubjectsByCategoryId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleAddNewSubject = async (newSubjectName) => {
    if (newSubjectName && newSubjectName.trim() !== '') {
      const newSubject = await addSubject(newSubjectName.trim(), categoryId);
      if (newSubject && newSubject._id) {
        onValueChange(newSubject._id);
        await loadSubjects(); // Refresh subjects list after adding
      } else {
        onValueChange(selectedValue); // Revert
        Alert.alert("Error", "Could not add subject. It might already exist in this category or there was a server issue.");
      }
    } else {
        onValueChange(selectedValue); // Revert if submission was empty
    }
  };

  const handleValueChange = (itemValue, itemIndex) => {
    if (itemValue === NEW_SUBJECT_VALUE) {
      if (!categoryId) {
        Alert.alert("Error", "Please select a category first before adding a subject.");
        onValueChange(selectedValue); // Revert or do nothing
        return;
      }
      setIsModalVisible(true);
    } else {
      onValueChange(itemValue);
    }
  };

  const pickerItems = [
    { label: categoryId ? 'Select Subject...' : 'Select Category First', value: '' },
    ...localSubjects.map(sub => ({ label: sub.name, value: sub._id })),
    // Only show "Add New Subject" if a category is selected and picker is enabled
    ...(enabled && categoryId ? [{ label: 'Add New Subject...', value: NEW_SUBJECT_VALUE }] : [])
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
        enabled={enabled && !!categoryId} // Ensure categoryId is truthy for enabled state
        prompt="Select a Subject"
      >
        {pickerItems.map((item) => (
          <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
        ))}
      </Picker>
      <InputModal
        visible={isModalVisible}
        onClose={() => {
            setIsModalVisible(false);
            onValueChange(selectedValue); // Revert on close without submit
        }}
        onSubmit={handleAddNewSubject}
        title="Add New Subject"
        placeholder="Enter subject name"
        submitButtonText="Add Subject"
      />
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