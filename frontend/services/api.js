import axios from 'axios';

// Determine the base URL based on the platform or environment
// Android Emulator typically uses 10.0.2.2 to access the host machine's localhost
// For physical devices, use your machine's local network IP.
// For iOS simulator, localhost usually works.
const BASE_URL = 'http://192.168.142.221:5001/api'; // Adjust if your backend port is different or if not using Android emulator

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Entry Endpoints ---
export const getEntries = () => apiClient.get('/entries');
export const createEntry = (entryData) => apiClient.post('/entries', entryData);
export const getEntryById = (id) => apiClient.get(`/entries/${id}`);
export const updateEntry = (id, entryData) => apiClient.put(`/entries/${id}`, entryData);
export const deleteEntry = (id) => apiClient.delete(`/entries/${id}`);

// --- Category Endpoints ---
export const getCategories = () => apiClient.get('/categories');
export const createCategory = (categoryData) => apiClient.post('/categories', categoryData);
export const getCategoryById = (id) => apiClient.get(`/categories/${id}`); // Optional, if needed by ID
export const updateCategory = (id, categoryData) => apiClient.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => apiClient.delete(`/categories/${id}`);

// Subject CRUD operations
export const getSubjects = (params) => apiClient.get('/subjects', { params }); // e.g., params = { categoryId: 'someId' }
export const getSubjectById = (id) => apiClient.get(`/subjects/${id}`);
export const createSubject = (subjectData) => apiClient.post('/subjects', subjectData);
export const updateSubject = (id, subjectData) => apiClient.put(`/subjects/${id}`, subjectData);
export const deleteSubject = (id) => apiClient.delete(`/subjects/${id}`);

export default apiClient; 