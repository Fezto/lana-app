// src/screens/Transactions.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export function Transactions() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary }}>
                Transaccionessss
            </Text>
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
    },
    button: {
        marginVertical: 8,
        width: '80%',
    },
});
