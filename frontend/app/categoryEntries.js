import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useBudget } from '../store/BudgetContext'; // Corrected path
import { FontAwesome } from '@expo/vector-icons';

export default function CategoryEntriesScreen() {
  const { categoryId, categoryName } = useLocalSearchParams();
  const { entries, loading: budgetLoading, error: budgetError, fetchEntries } = useBudget();
  const router = useRouter();

  const [categoryEntries, setCategoryEntries] = useState([]);
  const [totals, setTotals] = useState({ debit: 0, credit: 0, net: 0 });

  useEffect(() => {
    // Ensure entries are available, fetch if not (e.g., deep link or app starts here)
    if (entries.length === 0 && !budgetLoading) {
      fetchEntries();
    }
  }, [entries, budgetLoading, fetchEntries]);

  useEffect(() => {
    if (categoryId && entries.length > 0) {
      const filtered = entries.filter(entry => entry.category?._id === categoryId);
      setCategoryEntries(filtered.sort((a, b) => new Date(b.date) - new Date(a.date))); // Newest first

      let totalDebit = 0;
      let totalCredit = 0;
      filtered.forEach(entry => {
        totalDebit += entry.debit;
        totalCredit += entry.credit;
      });
      setTotals({ debit: totalDebit, credit: totalCredit, net: totalCredit - totalDebit });
    } else {
      setCategoryEntries([]);
      setTotals({ debit: 0, credit: 0, net: 0 });
    }
  }, [categoryId, entries]);

  const renderItem = ({ item }) => (
    <View style={styles.entryItem}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>{new Date(item.date).toLocaleDateString()}</Text>
        {/* Optionally, add edit/delete if they should work from this screen too */}
      </View>
      <Text style={styles.entrySubject}>{item.subject?.name || 'N/A'}</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.debit}>Debit: {item.debit.toFixed(2)}</Text>
        <Text style={styles.credit}>Credit: {item.credit.toFixed(2)}</Text>
      </View>
    </View>
  );

  if (budgetLoading && categoryEntries.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading entries...</Text>
      </View>
    );
  }

  if (budgetError && categoryEntries.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error: {budgetError}</Text>
         <TouchableOpacity onPress={() => fetchEntries()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoryName || 'Category Entries' }} />
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary for {categoryName || 'Category'}</Text>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income (Credit):</Text>
            <Text style={[styles.summaryValue, styles.creditValue]}>{totals.credit.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Expenses (Debit):</Text>
            <Text style={[styles.summaryValue, styles.debitValue]}>{totals.debit.toFixed(2)}</Text>
        </View>
         <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.netLabel]}>Net Total:</Text>
            <Text style={[styles.summaryValue, totals.net >= 0 ? styles.creditValue : styles.debitValue, styles.netValue]}>
                {totals.net.toFixed(2)}
            </Text>
        </View>
      </View>

      <FlatList
        data={categoryEntries}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        ListEmptyComponent={() => (
          !budgetLoading && ( // Don't show "no entries" if still loading
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No entries found for this category.</Text>
            </View>
          )
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  summaryContainer: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#555',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  netLabel: {
      fontWeight: 'bold',
  },
  netValue: {
      fontWeight: 'bold',
  },
  creditValue: {
      color: '#27ae60',
  },
  debitValue: {
      color: '#c0392b',
  },
  entryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10,
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
  entrySubject: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  debit: {
    color: '#c0392b',
    fontSize: 15,
  },
  credit: {
    color: '#27ae60',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 30,
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