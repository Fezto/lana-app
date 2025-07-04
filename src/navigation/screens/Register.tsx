// src/screens/Register.tsx
import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {TextInput, Button, Text, HelperText, useTheme} from 'react-native-paper';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';

import {UserCreate} from '@api/schemas/userCreate';
import {useRegisterUser} from '@api/auth';  // hook generado por Orval

export function RegisterScreen() {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const {
        control,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<UserCreate>({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            telephone: '',
            password: '',
        },
    });

    const {mutateAsync: register} = useRegisterUser();

    const onSubmit = async (data: UserCreate) => {
        try {
            const user = await register({data});
            console.log('Usuario registrado:', user);

            // Tras registro, redirigir al login
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
                    style={[styles.title, {color: theme.colors.primary}]}
                >
                    Crear Cuenta
                </Text>

                <Controller
                    control={control}
                    name="first_name"
                    rules={{required: 'Nombre es requerido'}}
                    render={({field: {onChange, onBlur, value}}) => (
                        <>
                            <TextInput
                                label="Nombre"
                                mode="outlined"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                            />
                            {errors.first_name && <HelperText type="error">{errors.first_name.message}</HelperText>}
                        </>
                    )}
                />

                <Controller
                    control={control}
                    name="last_name"
                    rules={{required: 'Apellido es requerido'}}
                    render={({field: {onChange, onBlur, value}}) => (
                        <>
                            <TextInput
                                label="Apellido"
                                mode="outlined"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                            />
                            {errors.last_name && <HelperText type="error">{errors.last_name.message}</HelperText>}
                        </>
                    )}
                />

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
                    name="telephone"
                    rules={{
                        pattern: {value: /^[0-9()+\s-]*$/, message: 'Teléfono inválido'},
                    }}
                    render={({field: {onChange, onBlur, value}}) => (
                        <>
                            <TextInput
                                label="Teléfono (opcional)"
                                mode="outlined"
                                keyboardType="phone-pad"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                style={styles.input}
                            />
                            {errors.telephone && <HelperText type="error">{errors.telephone.message}</HelperText>}
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
                    Registrarse
                </Button>

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
    input: {
        marginBottom: 12,
    },
    button: {
        marginVertical: 16,
    },
});
