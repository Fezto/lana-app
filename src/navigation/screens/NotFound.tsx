// src/screens/NotFound.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export function NotFound() {
  const navigation = useNavigation<any>();
  const theme = useTheme();

  return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="displaySmall" style={{ color: theme.colors.error }}>
          404
        </Text>
        <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
        >
          Go to Home
        </Button>
      </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
