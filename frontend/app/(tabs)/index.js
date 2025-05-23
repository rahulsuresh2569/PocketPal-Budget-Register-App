import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useBudget } from '../../store/BudgetContext';
import { FontAwesome } from '@expo/vector-icons';

export default function EntriesScreen() {
  const { entries, loading, error, fetchEntries, deleteExistingEntry } = useBudget();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [entriesWithBalance, setEntriesWithBalance] = useState([]);

  useEffect(() => {
    // Calculate running balance when entries change
    if (entries && entries.length > 0) {
      // Sort entries by date ascending to calculate balance correctly
      const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
      let currentBalance = 0;
      const calculatedEntries = sortedEntries.map(entry => {
        currentBalance = currentBalance + entry.credit - entry.debit;
        return { ...entry, runningBalance: currentBalance };
      });
      // Reverse for display (newest first)
      setEntriesWithBalance(calculatedEntries.reverse());
    } else {
      setEntriesWithBalance([]);
    }
  }, [entries]);

  const onRefresh = useCallback(async () => {
    console.log("Refreshing entries...");
    setRefreshing(true);
    await fetchEntries();
    setRefreshing(false);
    console.log("Entries refreshed.");
  }, [fetchEntries]);

  const handleEdit = (entryId) => {
    // TODO: Navigate to an edit screen (e.g., app/editEntry/[id].js or a modal)
    console.log("Edit entry:", entryId);
    // router.push(`/editEntry/${entryId}`); 
    alert("Edit functionality to be implemented.");
  };

  const handleDelete = async (entryId) => {
    // TODO: Implement deleteExistingEntry in BudgetContext and call it
    console.log("Delete entry:", entryId);
    alert("Delete functionality to be implemented. Call context.deleteExistingEntry(entryId)");
    // Example: if (await deleteExistingEntry(entryId)) { onRefresh(); } 
  };

  const navigateToCategoryEntries = (categoryId, categoryName) => {
    if (categoryId) {
      router.push({ pathname: '/categoryEntries', params: { categoryId, categoryName } });
    }
  };

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
        <Text style={styles.transactionType}>
            Type: {item.credit > 0 ? 'Income' : 'Expense'}
        </Text>
        <Text style={styles.runningBalanceLabel}>Balance: 
          <Text style={item.runningBalance >= 0 ? styles.positiveBalance : styles.negativeBalance}>
            {item.runningBalance.toFixed(2)}
          </Text>
        </Text>
      </View>
    </View>
  );

  // Determine if the main loading indicator should be shown
  const showInitialLoading = loading && !refreshing && entriesWithBalance.length === 0;

  if (showInitialLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading entries...</Text>
      </View>
    );
  }

  if (error && entriesWithBalance.length === 0 && !loading) { // Check !loading to prevent showing error during a refresh
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error fetching entries: {error}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.retryButton}> 
            <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={entriesWithBalance} // Use entriesWithBalance for display
        renderItem={renderItem}
        keyExtractor={item => item._id} 
        ListEmptyComponent={() => (
          !loading && !refreshing && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No entries yet. Pull down to refresh or add one!</Text>
            </View>
          )
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]}/>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 10, // Padding on list items instead for edge-to-edge scroll
    backgroundColor: '#f0f2f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  entryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10, // Added horizontal margin
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  entryDate: {
    fontSize: 13,
    color: '#555',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15, // Space out action buttons
    padding: 5, 
  },
  entryCategory: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textDecorationLine: 'underline', // Indicate it's tappable
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 5,
  },
  debit: {
    color: '#c0392b', // Darker red
    fontSize: 15,
    fontWeight: '500',
  },
  credit: {
    color: '#27ae60', // Darker green
    fontSize: 15,
    fontWeight: '500',
  },
  balanceContainer: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'space-between', // Space them out
    alignItems: 'center', // Vertically align items
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  transactionType: {
    fontSize: 13,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  runningBalanceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  positiveBalance: {
    color: '#27ae60', // Green for positive
  },
  negativeBalance: {
    color: '#c0392b', // Red for negative
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'red',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 