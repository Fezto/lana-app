// src/components/RegisterForm.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { UserCreate } from '@api/schemas/userCreate';

interface RegisterFormProps {
    onSubmit: (data: UserCreate) => Promise<void>;
    isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<UserCreate>({
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            telephone: '',
            password: '',
        },
    });

    return (
        <>
            <Controller
                control={control}
                name="first_name"
                rules={{ required: 'Nombre es requerido' }}
                render={({ field: { onChange, onBlur, value } }) => (
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
                rules={{ required: 'Apellido es requerido' }}
                render={({ field: { onChange, onBlur, value } }) => (
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
                name="telephone"
                rules={{
                    pattern: { value: /^[0-9()+\s-]*$/, message: 'Teléfono inválido' },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
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
                Registrarse
            </Button>
        </>
    );
}

const styles = StyleSheet.create({
    input: {
        marginBottom: 12,
    },
    button: {
        marginVertical: 16,
    },
});