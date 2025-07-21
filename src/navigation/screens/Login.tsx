// src/screens/Login.tsx
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { LoginForm } from '@forms/LoginForm';
import { LoginData } from '@api/schemas/loginData';
import { useLoginUser } from '@api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function LoginScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const { mutateAsync: login, isPending } = useLoginUser();

    const handleLogin = async (data: LoginData) => {
        try {
            const tokens = await login({ data });
            console.log('Tokens recibidos:', tokens);

            await AsyncStorage.setItem('access_token', tokens.access_token);
            await AsyncStorage.setItem('refresh_token', tokens.refresh_token);

            navigation.replace('App');
        } catch (error) {
            console.error('Error de login', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
                Iniciar Sesión
            </Text>

            <LoginForm onSubmit={handleLogin} isLoading={isPending} />

            <Button onPress={() => navigation.navigate('Register')} compact>
                ¿No tienes cuenta? Regístrate
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
    },
});