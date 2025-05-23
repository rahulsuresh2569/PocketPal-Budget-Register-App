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
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch entries';
      setError(errorMessage);
      Alert.alert("Error Fetching Entries", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new entry
  const addEntry = async (entryData) => {
    console.log("Attempting to add entry:", entryData);
    setLoading(true);
    setError(null);
    try {
      await apiCreateEntry(entryData);
      console.log("Entry added successfully via API.");
      await fetchEntries(); // Refresh the list
      return true; // Indicate success
    } catch (err) {
      console.error("Error adding entry:", err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add entry';
      setError(errorMessage);
      Alert.alert("Error Adding Entry", errorMessage);
      return false; // Indicate failure
    } finally {
      setLoading(false); // Ensure loading is reset
    }
  };

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    console.log("Attempting to fetch categories...");
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetCategories();
      setCategories(response.data);
      console.log("Categories fetched successfully:", response.data.length);
    } catch (err) {
      console.error("Error fetching categories:", err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch categories';
      setError(errorMessage);
      Alert.alert("Error Fetching Categories", errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch subjects for a specific category
  const fetchSubjectsByCategoryId = useCallback(async (categoryId) => {
    if (!categoryId) return []; // Avoid fetching if categoryId is null or undefined
    console.log(`Attempting to fetch subjects for category ID: ${categoryId}`);
    setLoading(true);
    setError(null);
    try {
      const response = await apiGetSubjects({ categoryId: categoryId });
      console.log(`Subjects for category ${categoryId} fetched:`, response.data.length);
      return response.data;
    } catch (err) {
      console.error(`Error fetching subjects for category ${categoryId}:`, err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch subjects';
      setError(errorMessage);
      Alert.alert("Error Fetching Subjects", errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

   // Add a new category
  const addCategory = async (categoryName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateCategory({ name: categoryName });
      await fetchCategories(); // Refresh categories
      Alert.alert("Success", "Category added!");
      return response.data; // Return new category
    } catch (err) {
      console.error("Error adding category:", err.response ? err.response.data : err.message);
      let errorMessage = 'Failed to add category. It might already exist or there was a server issue.';
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = err.response.data.message || "This category name already exists.";
        } else {
          errorMessage = err.response.data.message || err.message;
        }
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      Alert.alert("Error Adding Category", errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add a new subject to a category
  const addSubject = async (subjectName, categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCreateSubject({ name: subjectName, categoryId: categoryId });
      Alert.alert("Success", "Subject added!");
      return response.data; // Return new subject
    } catch (err) {
      console.error("Error adding subject:", err.response ? err.response.data : err.message);
      let errorMessage = 'Failed to add subject. It might already exist in this category or there was a server issue.';
      if (err.response) {
        if (err.response.status === 409) {
          errorMessage = err.response.data.message || "This subject name already exists in this category.";
        } else {
          errorMessage = err.response.data.message || err.message;
        }
      } else {
        errorMessage = err.message;
      }
      setError(errorMessage);
      Alert.alert("Error Adding Subject", errorMessage);
      return null;
    } finally {
      setLoading(false);
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
  }, [fetchEntries, fetchCategories]); // Dependencies are correct

  const value = {
    entries,
    categories,
    subjects,
    loading,
    error,
    fetchEntries,
    addEntry,
    fetchCategories,
    fetchSubjectsByCategoryId,
    addCategory,
    addSubject,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}; 