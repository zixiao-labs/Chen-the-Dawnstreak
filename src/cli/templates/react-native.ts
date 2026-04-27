export function rnAppJson(projectName: string): string {
  return JSON.stringify(
    {
      expo: {
        name: projectName,
        slug: projectName,
        version: '1.0.0',
        orientation: 'portrait',
        userInterfaceStyle: 'light',
        newArchEnabled: true,
        ios: { supportsTablet: true },
        android: { adaptiveIcon: { backgroundColor: '#ffffff' } },
        web: { bundler: 'metro' },
      },
    },
    null,
    2
  ) + '\n';
}

export function rnAppTsx(): string {
  return `import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '赤刃明霄陈' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
`;
}

export function rnHomeScreen(): string {
  return `import { View, Text, StyleSheet } from 'react-native';
import { useFetch } from 'chen-the-dawnstreak/native';

export default function HomeScreen() {
  useFetch<{ message: string }>('https://api.example.com/hello', {
    enabled: false,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>欢迎使用赤刃明霄陈</Text>
      <Text style={styles.subtitle}>轻量级 React 元框架</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
`;
}

export function rnTsconfigJson(): string {
  return `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.d.ts",
    "expo-env.d.ts"
  ]
}
`;
}

export function rnBabelConfig(): string {
  return `module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
`;
}

export function rnGitignore(): string {
  return `# OSX
.DS_Store

# Node
node_modules/
npm-debug.*

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Editor
.vscode/*
!.vscode/extensions.json
.idea

# Env
.env
.env.*
!.env.example
`;
}
