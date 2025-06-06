import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useBudget } from '../store/BudgetContext';
import InputModal from './InputModal';

const NEW_CATEGORY_VALUE = '__NEW_CATEGORY__';

const CategoryPicker = ({ selectedValue, onValueChange, style }) => {
  const { categories, fetchCategories, addCategory, loading: categoriesLoading } = useBudget();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    // Categories are fetched initially by BudgetContext, 
    // but if they are empty for some reason, this could be a fallback.
    // if (categories.length === 0) {
    //   fetchCategories();
    // }
  }, [categories, fetchCategories]);

  const handleAddNewCategory = async (newCategoryName) => {
    if (newCategoryName && newCategoryName.trim() !== '') {
      const newCategory = await addCategory(newCategoryName.trim());
      if (newCategory && newCategory._id) {
        onValueChange(newCategory._id); // Pass back the ID of the new category
      } else {
        // Handle error or if category wasn't added (e.g., duplicate name handled by context/API)
        // Revert to previously selected value or default if necessary, or show an alert
        onValueChange(selectedValue); 
        Alert.alert("Error", "Could not add category. It might already exist or there was a server issue.");
      }
    } else {
        onValueChange(selectedValue); // Revert if submission was empty
    }
  };

  const handleValueChange = (itemValue, itemIndex) => {
    if (itemValue === NEW_CATEGORY_VALUE) {
      setIsModalVisible(true);
    } else {
      onValueChange(itemValue);
    }
  };

  // On Android, Picker a item with an empty value can cause issues or be unselectable.
  // Ensure a placeholder is treated correctly or avoid empty value if it leads to problems.
  const pickerItems = [
    { label: 'Select Category...', value: '' }, // Placeholder item
    ...categories.map(cat => ({ label: cat.name, value: cat._id })),
    { label: 'Add New Category...', value: NEW_CATEGORY_VALUE }
  ];

  if (categoriesLoading && categories.length === 0) {
    return <Text style={styles.loadingText}>Loading categories...</Text>;
  }

  return (
    <View style={[styles.pickerContainer, style]}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={handleValueChange}
        style={styles.picker}
        prompt="Select a Category" // Android only: sets the title of the dialog
      >
        {pickerItems.map((item) => (
          <Picker.Item key={item.value || 'placeholder'} label={item.label} value={item.value} />
        ))}
      </Picker>
      <InputModal
        visible={isModalVisible}
        onClose={() => {
            setIsModalVisible(false);
            onValueChange(selectedValue); // Revert to previous selection if modal is closed without submit
        }}
        onSubmit={handleAddNewCategory}
        title="Add New Category"
        placeholder="Enter category name"
        submitButtonText="Add Category"
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
    justifyContent: 'center', // Center picker text on Android
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50, // iOS height is intrinsic, Android needs explicit height
    // On iOS, the Picker is quite tall by default. To control this, you might wrap it or use a custom modal.
  },
  loadingText: {
    paddingVertical: 15,
    textAlign: 'center',
    color: '#777'
  }
});

export default CategoryPicker; 