import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useBudget } from '../../store/BudgetContext';
import { FontAwesome } from '@expo/vector-icons';

export default function EntriesScreen() {
  const { entries, loading, error, fetchEntries, deleteExistingEntry } = useBudget();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // fetchEntries is called initially by the context itself.
    // We could call it here again if specific conditions require it, but often not needed for initial load.
    // console.log("EntriesScreen mounted. Current entries:", entries.length);
  }, []);

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
      {/* Display category and subject names. API now populates them. */}
      <Text style={styles.entryCategory}>
        {item.category?.name || 'N/A'} - {item.subject?.name || 'N/A'}
      </Text>
      <View style={styles.amountContainer}>
        <Text style={styles.debit}>Debit: {item.debit.toFixed(2)}</Text>
        <Text style={styles.credit}>Credit: {item.credit.toFixed(2)}</Text>
      </View>
      <View style={styles.balanceContainer}>
        {/* Running balance is complex to calculate here without full list context or backend support for it per item */}
        {/* For now, let's just show transaction type */}
        <Text style={styles.transactionType}>
            Type: {item.credit > 0 ? 'Income' : 'Expense'}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing && entries.length === 0) { // Show full screen loader only on initial load
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading entries...</Text>
      </View>
    );
  }

  if (error && entries.length === 0) {
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
        data={entries}
        renderItem={renderItem}
        keyExtractor={item => item._id} // Use _id from MongoDB
        ListEmptyComponent={() => (
          !loading && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No entries yet. Pull down to refresh or add one!</Text>
            </View>
          )
        )}
        refreshControl={ // Added RefreshControl
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