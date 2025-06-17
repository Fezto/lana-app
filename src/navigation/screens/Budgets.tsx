import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export function Budgets() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                Budgets Screen
            </Text>
            <Text variant="bodyMedium">Open up 'src/App.tsx' to start working on your app!</Text>

            <Button
                mode="outlined"
                onPress={() => navigation.navigate('Profile', { user: 'jane' })}
                style={styles.button}
            >
                Go to Profile
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('Settings')}
                style={styles.button}
            >
                Go to Settings
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
        gap: 12,
    },
    button: {
        width: '80%',
        marginTop: 8,
    },
});
