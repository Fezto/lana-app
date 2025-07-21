// src/screens/Register.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RegisterForm } from '@forms/RegisterForm';
import { UserCreate } from '@api/schemas/userCreate';
import { useRegisterUser } from '@api/auth';

export function RegisterScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const { mutateAsync: register, isPending } = useRegisterUser();

    const handleRegister = async (data: UserCreate) => {
        try {
            const user = await register({ data });
            console.log('Usuario registrado:', user);
            navigation.replace('Login');
        } catch (error) {
            console.error('Error al registrar:', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.container}>
                <Text
                    variant="headlineMedium"
                    style={[styles.title, { color: theme.colors.primary }]}
                >
                    Crear Cuenta
                </Text>

                <RegisterForm onSubmit={handleRegister} isLoading={isPending} />

                <Button onPress={() => navigation.navigate('Login')} compact>
                    ¿Ya tienes cuenta? Inicia Sesión
                </Button>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 24,
    },
});