import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from "@hooks/useAuth";  // <- nuevo hook

export function Home() {
    const theme = useTheme();
    const { user, isLoading, error } = useAuth();

    if (isLoading) {
        return (
            <Surface style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </Surface>
        );
    }


    if (error) {
        return (
            <Surface style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    {`Error: ${String(error) ?? 'Error desconocido'}`}
                </Text>
            </Surface>
        );
    }

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.primary }}>
                Home Screen
            </Text>
            <Text variant="bodyLarge">Email: {user?.email}</Text>
            <Text variant="bodyLarge">Usuario: {user?.first_name}</Text>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
