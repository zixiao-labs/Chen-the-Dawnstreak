"use client";

// Navigation — thin wrappers around React Navigation
export {
  NavigationContainer as ChenNativeRouter,
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';

export { createNativeStackNavigator } from '@react-navigation/native-stack';
export { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Framework hooks (all work in React Native out of the box)
export {
  useFetch,
  useMutation,
  createStore,
  createSimpleStore,
  useServerAction,
} from '../hooks/index.js';

// Native-specific form hook
export { useNativeForm } from './use-native-form.js';
export type { UseNativeFormOptions, UseNativeFormReturn } from './use-native-form.js';
