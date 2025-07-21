// CustomDrawerContent.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Button, ActivityIndicator, useTheme } from 'react-native-paper';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuth } from '@hooks/useAuth';

export function CustomDrawerContent(props: DrawerContentComponentProps) {
    const { user, isLoading, logout } = useAuth();
    const theme = useTheme();

    if (isLoading) {
        return (
            <DrawerContentScrollView {...props}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                    <Text style={styles.loadingText}>Cargando perfil...</Text>
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
        );
    }

    const handleLogout = async () => {
        await logout();
        // Navegar a login o pantalla inicial si es necesario
        // props.navigation.navigate('Login');
    };

    return (
        <DrawerContentScrollView {...props}>
            <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
                <Image
                    source={{
                        uri: user?.avatar_url || `https://i.pravatar.cc/150?u=${user?.email}`
                    }}
                    style={styles.avatar}
                />
                <Text style={[styles.welcome, { color: theme.colors.onSurface }]}>
                    Bienvenido {user?.first_name || 'Usuario'}
                </Text>
                <Text style={[styles.email, { color: theme.colors.onSurfaceVariant }]}>
                    {user?.email}
                </Text>
            </View>

            <DrawerItemList {...props} />

            <View style={styles.footer}>
                <Button
                    mode="outlined"
                    onPress={handleLogout}
                    icon="logout"
                    style={styles.logoutButton}
                >
                    Cerrar Sesión
                </Button>
            </View>
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        marginBottom: 10,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    welcome: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        opacity: 0.8,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    loadingText: {
        marginTop: 10,
        opacity: 0.7,
    },
    footer: {
        marginTop: 'auto',
        paddingHorizontal: 16,
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    logoutButton: {
        marginTop: 10,
    },
});