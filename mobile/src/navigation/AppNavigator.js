import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';

import HomeScreen from '../screens/client/HomeScreen';
import LawyersListScreen from '../screens/client/LawyersListScreen';
import LawyerProfileScreen from '../screens/client/LawyerProfileScreen';
import ServiceDetailScreen from '../screens/client/ServiceDetailScreen';
import MyRequestsScreen from '../screens/client/MyRequestsScreen';

import LawyerDashboardScreen from '../screens/lawyer/LawyerDashboardScreen';
import ManageServicesScreen from '../screens/lawyer/ManageServicesScreen';
import IncomingRequestsScreen from '../screens/lawyer/IncomingRequestsScreen';
import EditProfileScreen from '../screens/lawyer/EditProfileScreen';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerTitleAlign: 'center',
  headerStyle: { backgroundColor: '#0F6E56' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
  headerBackTitleVisible: false,
};

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ClientStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="LawyersList"
        component={LawyersListScreen}
        options={({ route }) => ({
          title: route.params?.specialty ? `محامون - ${route.params.specialty}` : 'المحامون',
        })}
      />
      <Stack.Screen name="LawyerProfile" component={LawyerProfileScreen} options={{ title: 'بروفايل المحامي' }} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} options={{ title: 'تفاصيل الخدمة' }} />
      <Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ title: 'طلباتي' }} />
    </Stack.Navigator>
  );
}

function LawyerStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="Dashboard" component={LawyerDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageServices" component={ManageServicesScreen} options={{ title: 'خدماتي' }} />
      <Stack.Screen name="IncomingRequests" component={IncomingRequestsScreen} options={{ title: 'الطلبات الواردة' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'تعديل البروفايل' }} />
    </Stack.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0F6E56" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.role === 'admin' ? (
        <AdminStack />
      ) : user.role === 'lawyer' ? (
        <LawyerStack />
      ) : (
        <ClientStack />
      )}
    </NavigationContainer>
  );
}
