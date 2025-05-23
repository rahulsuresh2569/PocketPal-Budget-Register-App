import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Alert, Platform, Modal, Button as RNButton } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useBudget } from '../../store/BudgetContext';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EntriesScreen() {
  const { entries, loading, error, fetchEntries, deleteExistingEntry } = useBudget();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [entriesWithBalance, setEntriesWithBalance] = useState([]);

  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  
  // For DateFilterModal internal state
  const [modalStartDate, setModalStartDate] = useState(null);
  const [modalEndDate, setModalEndDate] = useState(null);
  const [showDatePickerInModal, setShowDatePickerInModal] = useState(false);
  const [datePickerTargetInModal, setDatePickerTargetInModal] = useState(null); // 'start' or 'end'
  const [isDateFilterModalVisible, setIsDateFilterModalVisible] = useState(false);

  useEffect(() => {
    // When the modal opens, initialize its internal dates from the screen's filter dates
    if (isDateFilterModalVisible) {
      setModalStartDate(filterStartDate);
      setModalEndDate(filterEndDate);
    }
  }, [isDateFilterModalVisible, filterStartDate, filterEndDate]);

  useEffect(() => {
    let processedEntries = entries;
    if (filterStartDate && filterEndDate) {
      processedEntries = processedEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        const start = new Date(filterStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filterEndDate);
        end.setHours(23, 59, 59, 999);
        return entryDate >= start && entryDate <= end;
      });
    }
    if (processedEntries && processedEntries.length > 0) {
      const sortedEntries = [...processedEntries].sort((a, b) => new Date(a.date) - new Date(b.date));
      let currentBalance = 0;
      const calculatedEntries = sortedEntries.map(entry => {
        currentBalance = currentBalance + entry.credit - entry.debit;
        return { ...entry, runningBalance: currentBalance };
      });
      setEntriesWithBalance(calculatedEntries.reverse());
    } else {
      setEntriesWithBalance([]);
    }
  }, [entries, filterStartDate, filterEndDate]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
  }, [fetchEntries]);

  const handleEdit = (entryId) => router.push(`/editEntry/${entryId}`);
  const handleDelete = (entryId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", onPress: async () => await deleteExistingEntry(entryId), style: "destructive" },
    ]);
  };
  const navigateToCategoryEntries = (categoryId, categoryName) => {
    if (categoryId) router.push({ pathname: '/categoryEntries', params: { categoryId, categoryName } });
  };

  // Date Filter Modal Logic
  const handleModalDateChange = (event, selectedDate) => {
    // For Android, the picker closes itself. For iOS, we manage visibility via a "Done" button or by tapping away.
    // setShowDatePickerInModal(Platform.OS === 'ios'); // Keep visible on iOS until dismissal (handled by Done button now)
    if (event.type === "dismissed" && Platform.OS === 'android') {
        setShowDatePickerInModal(false);
        setDatePickerTargetInModal(null);
        return;
    }

    if (selectedDate) {
      if (datePickerTargetInModal === 'start') setModalStartDate(selectedDate);
      else if (datePickerTargetInModal === 'end') setModalEndDate(selectedDate);
    }
    
    // For Android, hide after selection. iOS will hide via "Done" button.
    if (Platform.OS === 'android') {
        setShowDatePickerInModal(false);
        setDatePickerTargetInModal(null);
    }
  };
  const showModalDatepickerFor = (target) => {
    setDatePickerTargetInModal(target);
    setShowDatePickerInModal(true);
  };
  const applyDateFiltersFromModal = () => {
    setFilterStartDate(modalStartDate);
    setFilterEndDate(modalEndDate);
    setIsDateFilterModalVisible(false);
  };

  const clearAndCloseDateFilters = () => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setModalStartDate(null);
    setModalEndDate(null);
    setIsDateFilterModalVisible(false);
  }

  const renderItem = ({ item }) => (
    <View style={styles.entryItem}>
        <View style={styles.entryHeader}>
            <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={() => handleEdit(item._id)} style={styles.actionButton}>
                    <FontAwesome name="pencil" size={18} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.actionButton}>
                    <FontAwesome name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
      <TouchableOpacity onPress={() => navigateToCategoryEntries(item.category?._id, item.category?.name)}>
        <Text style={styles.entryCategory}>
          {item.category?.name || 'N/A'} - {item.subject?.name || 'N/A'}
        </Text>
      </TouchableOpacity>
      <View style={styles.amountContainer}>
        <Text style={styles.debit}>Debit: {item.debit.toFixed(2)}</Text>
        <Text style={styles.credit}>Credit: {item.credit.toFixed(2)}</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.transactionType}>Type: {item.credit > 0 ? 'Income' : 'Expense'}</Text>
        <Text style={styles.runningBalanceLabel}>Balance: 
          <Text style={item.runningBalance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
            {item.runningBalance.toFixed(2)}
          </Text>
        </Text>
      </View>
    </View>
  );

  const showInitialLoading = loading && !refreshing && entriesWithBalance.length === 0 && !(filterStartDate && filterEndDate);
  if (showInitialLoading) return <View style={[styles.container, styles.centerContent]}><ActivityIndicator size="large" color="#2563eb" /><Text>Loading entries...</Text></View>;
  if (error && entriesWithBalance.length === 0 && !loading) return <View style={[styles.container, styles.centerContent]}><Text style={styles.errorText}>Error: {error}</Text><TouchableOpacity onPress={onRefresh} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setIsDateFilterModalVisible(true)} style={{ marginRight: 20, padding:5 }}>
                <FontAwesome name={(filterStartDate && filterEndDate) ? "filter" : "calendar-o"} size={22} color="#2563eb" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/dashboard')} style={{ marginRight: 15, padding:5 }}>
                <FontAwesome name="tachometer" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDateFilterModalVisible}
        onRequestClose={() => setIsDateFilterModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1} 
            onPressOut={() => setIsDateFilterModalVisible(false)}
        >
            <View style={styles.modalView} onStartShouldSetResponder={() => true}> 
                <Text style={styles.modalTitle}>Filter Entries by Date</Text>
                
                <View style={styles.modalDateInputRow}>
                    <TouchableOpacity onPress={() => showModalDatepickerFor('start')} style={styles.modalDateButton}>
                        <Text style={styles.modalDateButtonText}>{modalStartDate ? modalStartDate.toLocaleDateString() : 'Start Date'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => showModalDatepickerFor('end')} style={styles.modalDateButton}>
                        <Text style={styles.modalDateButtonText}>{modalEndDate ? modalEndDate.toLocaleDateString() : 'End Date'}</Text>
                    </TouchableOpacity>
                </View>

                {showDatePickerInModal && (
                    <View>
                        <DateTimePicker
                            value={datePickerTargetInModal === 'start' ? (modalStartDate || new Date()) : (modalEndDate || new Date())}
                            mode={"date"}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleModalDateChange}
                        />
                        {Platform.OS === 'ios' && (
                            <View style={styles.iosPickerModalControls}> 
                                <RNButton title="Done" onPress={() => {
                                    setShowDatePickerInModal(false); 
                                    // setDatePickerTargetInModal(null); // Don't nullify, so it remembers 'start' or 'end' if picker is reopened
                                }} />
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.modalActionsRow}>
                    <TouchableOpacity onPress={applyDateFiltersFromModal} style={[styles.modalButton, styles.applyButton]} disabled={!modalStartDate || !modalEndDate}>
                        <Text style={styles.modalButtonText}>Apply</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearAndCloseDateFilters} style={[styles.modalButton, styles.clearModalButton]}>
                        <Text style={styles.modalButtonText}>Clear & Close</Text>
                    </TouchableOpacity>
                </View>
                 <TouchableOpacity onPress={() => setIsDateFilterModalVisible(false)} style={[styles.modalButton, styles.cancelButton, {marginTop: 10}]}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>

      {(!loading && filterStartDate && filterEndDate && entriesWithBalance.length > 0) && (
        <View style={styles.activeFilterInfoContainer}>
            <Text style={styles.activeFilterText}>
                Showing entries: {filterStartDate.toLocaleDateString()} - {filterEndDate.toLocaleDateString()}
            </Text>
             <TouchableOpacity onPress={clearAndCloseDateFilters} style={styles.activeFilterClearButton}>
                <FontAwesome name="times-circle" size={18} color="#ef4444" />
            </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={entriesWithBalance}
        renderItem={renderItem}
        keyExtractor={item => item._id} 
        ListEmptyComponent={() => (
          !loading && !refreshing && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>
                { (filterStartDate && filterEndDate) 
                  ? 'No entries found for this date range.'
                  : 'No entries yet. Pull down to refresh or add one!'
                }
              </Text>
            </View>
          )
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]}/>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  entryItem: { backgroundColor: '#fff', padding: 15, marginVertical: 6, marginHorizontal: 10, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  entryDate: { fontSize: 13, color: '#555' },
  actionsContainer: { flexDirection: 'row' },
  actionButton: { marginLeft: 15, padding: 5 },
  entryCategory: { fontSize: 17, fontWeight: '600', color: '#333', marginBottom: 6, textDecorationLine: 'underline' },
  amountContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 5 },
  debit: { color: '#c0392b', fontSize: 15, fontWeight: '500' },
  credit: { color: '#27ae60', fontSize: 15, fontWeight: '500' },
  balanceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#eee' },
  transactionType: { fontSize: 13, color: '#7f8c8d', fontStyle: 'italic' },
  runningBalanceLabel: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  positiveBalance: { color: '#27ae60' },
  negativeBalance: { color: '#c0392b' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#777' },
  errorText: { textAlign: 'center', fontSize: 16, color: 'red', marginBottom: 15 },
  retryButton: { backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: "white", borderRadius: 20, padding: 25, alignItems: "stretch", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalDateInputRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  modalDateButton: { padding: 12, backgroundColor: '#eef2f9', borderRadius: 8, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  modalDateButtonText: { fontSize: 16, color: '#333' }, 
  iosPickerModalControls: { flexDirection: "row", justifyContent: "flex-end", paddingVertical: 10, backgroundColor: '#f8f8f8', borderTopWidth: 1, borderColor: '#eee', marginTop: Platform.OS === 'ios' ? 10 : 0  }, // Removed conditional marginTop based on showDatePickerInModal
  modalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  modalButton: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 10, elevation: 2, minWidth: 100, alignItems: 'center', justifyContent: 'center', flex: 1, marginHorizontal: 5, },
  applyButton: { backgroundColor: "#2563eb" },
  clearModalButton: { backgroundColor: "#f59e0b" }, 
  cancelButton: { backgroundColor: "#6b7280" }, 
  modalButtonText: { color: "white", fontWeight: "bold", textAlign: "center", fontSize: 15 },
  
  // Active Filter Info Bar
  activeFilterInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, backgroundColor: '#e0e7ff' },
  activeFilterText: { fontSize: 13, color: '#3730a3', flexShrink: 1 }, // Allow text to shrink
  activeFilterClearButton: { paddingLeft: 10, } // Add some padding for easier tap
}); 