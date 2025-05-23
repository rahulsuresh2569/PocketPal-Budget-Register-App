import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; // Or any other icon set

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: 'blue', // Example: customize active tab color
        // headerShown: false, // If you want to hide headers for all tab screens
      }}
    >
      <Tabs.Screen
        name="index" // This will be app/(tabs)/index.js
        options={{
          title: 'Entries',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="list" size={size} color={color} />
          ),
          // headerRight: () => ( // Example: Add a button to the header
          //   <Button onPress={() => console.log('Header button pressed!')} title="Info" />
          // ),
        }}
      />
      <Tabs.Screen
        name="add" // This will be app/(tabs)/add.js
        options={{
          title: 'Add Entry',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="plus" size={size} color={color} />
          ),
        }}
      />
      {/* You can add more tabs here, e.g., for settings or categories */}
    </Tabs>
  );
} 