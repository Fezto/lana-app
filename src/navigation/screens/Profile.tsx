// src/screens/Profile.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { StaticScreenProps } from '@react-navigation/native';

type Props = StaticScreenProps<{
  user: string;
}>;

export function Profile({ route }: Props) {
  const theme = useTheme();
  const { user } = route.params;

  return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
          {user}'s Profile
        </Text>
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
