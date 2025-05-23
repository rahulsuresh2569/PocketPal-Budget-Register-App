import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Button as RNButton, Dimensions } from 'react-native';
import { Stack } from 'expo-router';
import { useBudget } from '../store/BudgetContext';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Collapsible from 'react-native-collapsible';
import { FontAwesome } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(51, 65, 85, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#2563eb",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#e0e0e0",
  }
};

const PREDEFINED_PERIODS = {
  ALL_TIME: 'allTime',
  CURRENT_MONTH: 'currentMonth',
  LAST_30_DAYS: 'last30Days',
  CUSTOM_RANGE: 'customRange',
};

export default function DashboardScreen() {
  const { entries, categories, loading: budgetLoading, error: budgetError } = useBudget();

  const [selectedPeriod, setSelectedPeriod] = useState(PREDEFINED_PERIODS.ALL_TIME);
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null);

  const [isOverallSummaryCollapsed, setIsOverallSummaryCollapsed] = useState(false);
  const [isCategorySummaryCollapsed, setIsCategorySummaryCollapsed] = useState(false);
  const [isChartsCollapsed, setIsChartsCollapsed] = useState(false);

  useEffect(() => {
    updateDatesForPeriod(selectedPeriod);
  }, [selectedPeriod]);

  const updateDatesForPeriod = (period) => {
    const today = new Date();
    let start = null;
    let end = null;

    switch (period) {
      case PREDEFINED_PERIODS.CURRENT_MONTH:
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case PREDEFINED_PERIODS.LAST_30_DAYS:
        end = new Date(today);
        end.setHours(23, 59, 59, 999);
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        start.setHours(0, 0, 0, 0);
        break;
      case PREDEFINED_PERIODS.ALL_TIME:
      case PREDEFINED_PERIODS.CUSTOM_RANGE:
      default:
        start = null;
        end = null;
        break;
    }
    setFilterStartDate(start);
    setFilterEndDate(end);
  };
  
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || (datePickerTarget === 'start' ? filterStartDate : filterEndDate);
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setDatePickerTarget(null);
      return;
    }
    if (currentDate) {
      if (datePickerTarget === 'start') setFilterStartDate(currentDate);
      else setFilterEndDate(currentDate);
    }
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
        setDatePickerTarget(null);
    }
  };

  const showDatepickerFor = (target) => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const summaryData = useMemo(() => {
    let processedEntries = entries;

    if (selectedPeriod !== PREDEFINED_PERIODS.ALL_TIME && filterStartDate && filterEndDate) {
      processedEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const start = new Date(filterStartDate);
        start.setHours(0,0,0,0);
        const end = new Date(filterEndDate);
        end.setHours(23,59,59,999);
        return entryDate >= start && entryDate <= end;
      });
    }

    const initialReturn = {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
      categorySummary: [],
      pieChartData: [],
      barChartData: { labels: [], datasets: [{ data: [] }] },
      hasData: false,
    };

    if (!processedEntries || processedEntries.length === 0) {
      return initialReturn;
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryMap = new Map();

    categories.forEach(cat => {
      categoryMap.set(cat._id, { name: cat.name, income: 0, expenses: 0, entryCount: 0, color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` });
    });

    processedEntries.forEach(entry => {
      totalIncome += entry.credit;
      totalExpenses += entry.debit;
      
      const catId = entry.category?._id;
      if (catId && categoryMap.has(catId)) {
        const catData = categoryMap.get(catId);
        catData.income += entry.credit;
        catData.expenses += entry.debit;
        catData.entryCount += 1;
      } else if (catId) {
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
        categoryMap.set(catId, {
          name: entry.category?.name || 'Unknown Category',
          income: entry.credit,
          expenses: entry.debit,
          entryCount: 1,
          color: randomColor
        });
      }
    });

    const categorySummary = Array.from(categoryMap.values())
        .filter(cat => cat.entryCount > 0)
        .map(cat => ({
            ...cat,
            net: cat.income - cat.expenses,
        })).sort((a,b) => b.expenses - a.expenses);
    
    const pieChartData = [];
    if (totalIncome > 0) pieChartData.push({ name: 'Income', amount: totalIncome, color: '#27ae60', legendFontColor: '#333', legendFontSize: 14 });
    if (totalExpenses > 0) pieChartData.push({ name: 'Expenses', amount: totalExpenses, color: '#c0392b', legendFontColor: '#333', legendFontSize: 14 });

    const barChartLabels = categorySummary.filter(c => c.expenses > 0).map(c => c.name);
    const barChartExpenseData = categorySummary.filter(c => c.expenses > 0).map(c => c.expenses);
    const barChartData = (barChartLabels.length > 0) ? {
        labels: barChartLabels,
        datasets: [{
            data: barChartExpenseData,
            colors: categorySummary.filter(c => c.expenses > 0).map(() => (opacity = 1) => `rgba(192, 57, 43, ${opacity})`)
        }]
    } : initialReturn.barChartData;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categorySummary,
      pieChartData,
      barChartData,
      hasData: processedEntries.length > 0,
    };
  }, [entries, categories, selectedPeriod, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!summaryData.hasData || (summaryData.barChartData.labels.length === 0 && summaryData.pieChartData.length === 0)) {
        setIsChartsCollapsed(true);
    } else {
        setIsChartsCollapsed(false);
    }
  }, [summaryData.hasData, summaryData.barChartData, summaryData.pieChartData]);

  const renderCollapsibleHeader = (title, isCollapsed, onPress) => (
    <TouchableOpacity onPress={onPress} style={styles.collapsibleHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <FontAwesome name={isCollapsed ? "chevron-down" : "chevron-up"} size={18} color="#333" />
    </TouchableOpacity>
  );

  if (budgetLoading && entries.length === 0 && !summaryData.hasData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text>Loading dashboard data...</Text>
      </View>
    );
  }

  if (budgetError && entries.length === 0 && !summaryData.hasData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Error loading data: {budgetError}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Dashboard' }} />

      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>Select Period:</Text>
        <View style={styles.pickerContainer}>
            <Picker
            selectedValue={selectedPeriod}
            onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            >
            <Picker.Item label="All Time" value={PREDEFINED_PERIODS.ALL_TIME} />
            <Picker.Item label="Current Month" value={PREDEFINED_PERIODS.CURRENT_MONTH} />
            <Picker.Item label="Last 30 Days" value={PREDEFINED_PERIODS.LAST_30_DAYS} />
            <Picker.Item label="Custom Range..." value={PREDEFINED_PERIODS.CUSTOM_RANGE} />
            </Picker>
        </View>
        
        {selectedPeriod === PREDEFINED_PERIODS.CUSTOM_RANGE && (
          <View style={styles.dateFilterContainer}>
            <TouchableOpacity onPress={() => showDatepickerFor('start')} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{filterStartDate ? filterStartDate.toLocaleDateString() : 'Start Date'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => showDatepickerFor('end')} style={styles.dateButton}>
              <Text style={styles.dateButtonText}>{filterEndDate ? filterEndDate.toLocaleDateString() : 'End Date'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showDatePicker && (
        <View>
            <DateTimePicker
                value={datePickerTarget === 'start' ? (filterStartDate || new Date()) : (filterEndDate || new Date())}
                mode={"date"}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
            />
            {Platform.OS === 'ios' && (
                <View style={styles.iosPickerControls}> 
                    <RNButton title="Done" onPress={() => {setShowDatePicker(false); setDatePickerTarget(null);}} />
                </View>
            )}
        </View>
      )}

      {!summaryData.hasData && !budgetLoading && (
        <View style={[styles.summaryCard, styles.centerContent, {marginTop: 20}]}>
            <Text style={styles.emptyText}>No data available for the selected period.</Text>
        </View>
      )}

      {summaryData.hasData && (
        <>
            <View style={styles.summaryCard}>
                {renderCollapsibleHeader("Overall Financial Summary", isOverallSummaryCollapsed, () => setIsOverallSummaryCollapsed(!isOverallSummaryCollapsed))}
                <Collapsible collapsed={isOverallSummaryCollapsed} style={styles.collapsibleContent}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Income:</Text>
                        <Text style={[styles.summaryValue, styles.incomeText]}>{summaryData.totalIncome.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Total Expenses:</Text>
                        <Text style={[styles.summaryValue, styles.expenseText]}>{summaryData.totalExpenses.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.netRow]}>
                        <Text style={[styles.summaryLabel, styles.netLabel]}>Net Balance:</Text>
                        <Text style={[styles.summaryValue, summaryData.netBalance >= 0 ? styles.incomeText : styles.expenseText, styles.netValue]}>
                        {summaryData.netBalance.toFixed(2)}
                        </Text>
                    </View>
                </Collapsible>
            </View>

            <View style={styles.summaryCard}>
                {renderCollapsibleHeader(`Summary by Category (${summaryData.categorySummary.length})`, isCategorySummaryCollapsed, () => setIsCategorySummaryCollapsed(!isCategorySummaryCollapsed))}
                <Collapsible collapsed={isCategorySummaryCollapsed} style={styles.collapsibleContent}>
                {summaryData.categorySummary.length > 0 ? (
                    summaryData.categorySummary.map((cat, index) => (
                    <View key={cat.name + index} style={styles.categoryItem}>
                        <Text style={styles.categoryName}>{cat.name} ({cat.entryCount} entries)</Text>
                        <View style={styles.summaryRowSmall}>
                        <Text style={styles.summaryLabelSmall}>Income:</Text>
                        <Text style={[styles.summaryValueSmall, styles.incomeTextSmall]}>{cat.income.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRowSmall}>
                        <Text style={styles.summaryLabelSmall}>Expenses:</Text>
                        <Text style={[styles.summaryValueSmall, styles.expenseTextSmall]}>{cat.expenses.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRowSmallNet}>
                        <Text style={[styles.summaryLabelSmall, styles.netLabelSmall]}>Net:</Text>
                        <Text style={[styles.summaryValueSmall, cat.net >= 0 ? styles.incomeTextSmall : styles.expenseTextSmall, styles.netValueSmall]}>
                            {cat.net.toFixed(2)}
                        </Text>
                        </View>
                    </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No category data to display for this period.</Text>
                )}
                </Collapsible>
            </View>

            <View style={styles.summaryCard}>
                {renderCollapsibleHeader("Visualizations", isChartsCollapsed, () => setIsChartsCollapsed(!isChartsCollapsed))}
                <Collapsible collapsed={isChartsCollapsed} style={styles.collapsibleContent}>
                    {summaryData.barChartData.labels.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Expenses by Category</Text>
                            <BarChart
                                data={summaryData.barChartData}
                                width={screenWidth - 60}
                                height={230}
                                yAxisLabel="$"
                                chartConfig={chartConfig}
                                verticalLabelRotation={30}
                                fromZero={true}
                                showValuesOnTopOfBars={true}
                                style={styles.chartStyle}
                            />
                        </View>
                    ) : (
                        <Text style={styles.emptyChartText}>No expense data for bar chart.</Text>
                    )}

                    {summaryData.pieChartData.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <Text style={styles.chartTitle}>Income vs Expenses</Text>
                            <PieChart
                                data={summaryData.pieChartData}
                                width={screenWidth - 60}
                                height={220}
                                chartConfig={chartConfig}
                                accessor={"amount"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                absolute
                                style={styles.chartStyle}
                            />
                        </View>
                    ) : (
                        <Text style={styles.emptyChartText}>No income/expense data for pie chart.</Text>
                    )}
                    {(summaryData.barChartData.labels.length === 0 && summaryData.pieChartData.length === 0) && (
                         <Text style={styles.emptyText}>No data available for charts in this period.</Text>
                    )}
                </Collapsible>
            </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  filterCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 10, marginTop: 10, marginBottom: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  filterTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  pickerContainer: { borderColor: '#ddd', borderWidth: 1, borderRadius: 5, marginBottom: 10, backgroundColor: '#fff' },
  picker: { height: Platform.OS === 'ios' ? 120 : 50 },
  pickerItem: {},
  dateFilterContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 },
  dateButton: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginHorizontal: 5, flex: 1, alignItems: 'center' },
  dateButtonText: { fontSize: 14, color: '#333' },
  iosPickerControls: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 10, paddingBottom: 10, backgroundColor: '#f8f8f8', borderTopWidth: 1, borderColor: '#ccc' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, marginHorizontal: 10, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  collapsibleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  collapsibleContent: { paddingTop: 5, paddingBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingVertical: 5 },
  summaryRowSmall: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, paddingVertical: 3 },
  summaryRowSmallNet: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  summaryLabel: { fontSize: 16, color: '#555' },
  summaryValue: { fontSize: 16, fontWeight: '500' },
  summaryLabelSmall: { fontSize: 14, color: '#666' },
  summaryValueSmall: { fontSize: 14, fontWeight: '500' },
  netRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
  netLabel: { fontWeight: 'bold', fontSize: 17 },
  netValue: { fontWeight: 'bold', fontSize: 17 },
  netLabelSmall: { fontWeight: 'bold' },
  netValueSmall: { fontWeight: 'bold' },
  incomeText: { color: '#27ae60' },
  expenseText: { color: '#c0392b' },
  incomeTextSmall: { color: '#27ae60' },
  expenseTextSmall: { color: '#c0392b' },
  categoryItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  categoryName: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 6 },
  emptyText: { textAlign: 'center', fontSize: 15, color: '#777', marginTop: 10, paddingVertical: 10 },
  errorText: { textAlign: 'center', fontSize: 16, color: 'red' },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 10,
  },
  emptyChartText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#777',
    paddingVertical: 15,
  }
}); 