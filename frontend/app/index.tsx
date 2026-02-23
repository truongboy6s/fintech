import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import SplashScreen from '@/components/SplashScreen';
import { Colors } from '@/constants/colors';

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    // Show splash for minimum time
    const timer = setTimeout(() => {
      checkInitialRoute();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkInitialRoute = async () => {
    try {
      // Check if user has seen onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // Check if user is logged in
      const token = await SecureStore.getItemAsync('authToken');

      if (!hasSeenOnboarding) {
        // First time user - show onboarding
        setDestination('/onboarding');
      } else if (token) {
        // User is logged in - go to home
        setDestination('/(tabs)');
      } else {
        // User has seen onboarding but not logged in - show welcome
        setDestination('/(auth)/welcome');
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
      setDestination('/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  if (destination) {
    return <Redirect href={destination as any} />;
  }

  return null;
}
