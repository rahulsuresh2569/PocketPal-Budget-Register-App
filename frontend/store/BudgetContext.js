import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  getEntries as apiGetEntries,
  createEntry as apiCreateEntry,
  updateEntry as apiUpdateEntry,
  deleteEntry as apiDeleteEntry,
  getCategories as apiGetCategories,
  createCategory as apiCreateCategory,
  getSubjects as apiGetSubjects,
  createSubject as apiCreateSubject
} from '../services/api'; // Assuming api.js is in ../services
import { Alert } from 'react-native';

const BudgetContext = createContext();

export const useBudget = () => {
  return useContext(BudgetContext);
};

export const BudgetProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]); // Can be a map: { categoryId: [subjects] }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all entries
  const fetchEntries = useCallback(async () => {
    console.log("Attempting to fetch entries...");
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetEntries();
      setEntries(response.data);
      console.log("Entries fetched successfully:", response.data.length);
    } catch (err) {
      console.error("Error fetching entries:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message || 'Failed to fetch entries');
      Alert.alert("Error", "Could not fetch entries. " + (err.response ? err.response.data.message : err.message));
    }
    setLoading(false);
  }, []);

  // Add a new entry
  const addEntry = async (entryData) => {
    console.log("Attempting to add entry:", entryData);
    setLoading(true);
    try {
      await apiCreateEntry(entryData);
      console.log("Entry added successfully via API.");
      await fetchEntries(); // Refresh the list
      return true; // Indicate success
    } catch (err) {
      console.error("Error adding entry:", err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.message : err.message || 'Failed to add entry');
      Alert.alert("Error Adding Entry", err.response ? err.response.data.message : err.message);
      return false; // Indicate failure
    }
  };

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    console.log("Attempting to fetch categories...");
    setLoading(true);
    try {
      const response = await apiGetCategories();
      setCategories(response.data);
      console.log("Categories fetched successfully:", response.data.length);
    } catch (err) {
      console.error("Error fetching categories:", err.response ? err.response.data : err.message);
      Alert.alert("Error", "Could not fetch categories. " + (err.response ? err.response.data.message : err.message));
    }
    setLoading(false);
  }, []);

  // Fetch subjects for a specific category
  const fetchSubjectsByCategoryId = useCallback(async (categoryId) => {
    console.log(`Attempting to fetch subjects for category ID: ${categoryId}`);
    setLoading(true);
    try {
      const response = await apiGetSubjects({ params: { categoryId } }); // Pass categoryId as query param
      // Store subjects in a way that they can be accessed by category, e.g., a map or update a filtered list
      // For simplicity now, just setting all fetched subjects if only one category's subjects are active at a time
      setSubjects(response.data);
      console.log(`Subjects for category ${categoryId} fetched:`, response.data.length);
      return response.data; // Return for immediate use if needed
    } catch (err) {
      console.error(`Error fetching subjects for category ${categoryId}:`, err.response ? err.response.data : err.message);
      Alert.alert("Error", `Could not fetch subjects. ` + (err.response ? err.response.data.message : err.message));
      return [];
    }
    setLoading(false);
  }, []);

   // Add a new category
  const addCategory = async (categoryName) => {
    setLoading(true);
    try {
      const response = await apiCreateCategory({ name: categoryName });
      await fetchCategories(); // Refresh categories
      Alert.alert("Success", "Category added!");
      return response.data; // Return new category
    } catch (err) {
      console.error("Error adding category:", err.response ? err.response.data : err.message);
      Alert.alert("Error Adding Category", err.response ? err.response.data.message : err.message);
      return null;
    }
  };

  // Add a new subject to a category
  const addSubject = async (subjectName, categoryId) => {
    setLoading(true);
    try {
      const response = await apiCreateSubject({ name: subjectName, categoryId });
      // Optionally, refresh subjects for that category if they are being displayed
      // await fetchSubjectsByCategoryId(categoryId);
      Alert.alert("Success", "Subject added!");
      return response.data; // Return new subject
    } catch (err) {
      console.error("Error adding subject:", err.response ? err.response.data : err.message);
      Alert.alert("Error Adding Subject", err.response ? err.response.data.message : err.message);
      return null;
    }
  };
  
  // Placeholder for update and delete functions for entries, categories, subjects
  // const updateExistingEntry = async (id, data) => { ... }
  // const deleteExistingEntry = async (id) => { ... }

  // Initial data fetch
  useEffect(() => {
    console.log("BudgetContext: Initial data fetch effect triggered.");
    fetchEntries();
    fetchCategories();
    // Don't fetch all subjects initially, only when a category is selected
  }, [fetchEntries, fetchCategories]);

  const value = {
    entries,
    categories,
    subjects, // This will hold subjects, likely filtered by a selected category
    loading,
    error,
    fetchEntries,
    addEntry,
    fetchCategories,
    fetchSubjectsByCategoryId,
    addCategory,
    addSubject,
    // updateExistingEntry, // Add later
    // deleteExistingEntry  // Add later
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 