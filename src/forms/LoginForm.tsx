// src/components/LoginForm.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { LoginData } from '@api/schemas/loginData';

interface LoginFormProps {
    onSubmit: (data: LoginData) => Promise<void>;
    isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        defaultValues: { email: '', password: '' },
    });

    return (
        <>
            <Controller
                control={control}
                name="email"
                rules={{
                    required: 'Email es requerido',
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Formato inválido' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
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
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
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
                loading={isLoading}
                style={styles.button}
            >
                Entrar
            </Button>
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 8,
    },
    button: {
        marginVertical: 16,
    },
});