// src/screens/Login.tsx
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TextInput, Button, Text, HelperText, useTheme} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';


import {LoginData} from '@api/schemas/loginData'
import {useLoginUser} from "@api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function LoginScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const {
        control,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<LoginData>({
        defaultValues: {email: '', password: ''},
    });

    const {mutateAsync: login} = useLoginUser();

    const onSubmit = async (data: LoginData) => {
        try {
            const tokens = await login({data});
            console.log('Tokens recibidos:', tokens);

            await AsyncStorage.setItem('access_token', tokens.access_token);
            await AsyncStorage.setItem('refresh_token', tokens.refresh_token);


            navigation.replace('Home');
        } catch (error) {
            console.error('Error de login', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium" style={[styles.title, {color: theme.colors.primary}]}>Iniciar Sesión</Text>

            <Controller
                control={control}
                name="email"
                rules={{
                    required: 'Email es requerido',
                    pattern: {value: /\S+@\S+\.\S+/, message: 'Formato inválido'},
                }}
                render={({field: {onChange, onBlur, value}}) => (
                    <>
                        <TextInput
                            label="Email"
                            mode="outlined"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            style={styles.input}
                        />
                        {errors.email && <HelperText type="error">{errors.email.message}</HelperText>}
                    </>
                )}
            />

            <Controller
                control={control}
                name="password"
                rules={{
                    required: 'Contraseña es requerida',
                    minLength: {value: 6, message: 'Mínimo 6 caracteres'},
                }}
                render={({field: {onChange, onBlur, value}}) => (
                    <>
                        <TextInput
                            label="Contraseña"
                            mode="outlined"
                            secureTextEntry
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            style={styles.input}
                        />
                        {errors.password && <HelperText type="error">{errors.password.message}</HelperText>}
                    </>
                )}
            />

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                style={styles.button}
            >
                Entrar
            </Button>

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
    input: {
        marginBottom: 8,
    },
    button: {
        marginVertical: 16,
    },
});
