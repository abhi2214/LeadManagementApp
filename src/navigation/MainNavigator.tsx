import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '../types';
import { COLORS } from '../constants';
import DashboardScreen from '../screens/DashboardScreen';
import LeadDetailsScreen from '../screens/LeadDetailsScreen';
import AddEditLeadScreen from '../screens/AddEditLeadScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();
export default function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} options={{ title: 'Lead Details' }} />
      <Stack.Screen name="AddEditLead" component={AddEditLeadScreen} options={{ title: 'Lead' }} />
    </Stack.Navigator>
  );
}
