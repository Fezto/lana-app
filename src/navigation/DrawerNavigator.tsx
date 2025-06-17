import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

import { Home } from '@screens/Home';
import { Transactions } from '@screens/Transactions';
import { Budgets } from '@screens/Budgets';
import { Profile } from '@screens/Profile';
import { Settings } from '@screens/Settings';
import { NotFound } from '@screens/NotFound';
import { CustomDrawerContent } from '@navigation/drawer/CustomDrawerContent';

const Drawer = createDrawerNavigator();

export function DrawerNavigator() {
    const theme = useTheme();

    return (
        <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerTintColor: '#fff',
                headerStyle: { backgroundColor: theme.colors.primary },
                drawerStyle: {
                    backgroundColor: theme.colors.surface,
                    width: 280,
                },
                drawerActiveTintColor: theme.colors.primary,
                drawerInactiveTintColor: theme.colors.onSurfaceVariant,
            }}
        >
            {/* Pantallas de la app */}
            <Drawer.Screen
                name="Home"
                component={Home}
                options={{
                    title: 'Panel Principal',
                    drawerIcon: ({ color, size }) => <Icon name="home-outline" color={color} size={size} />,
                }}
            />
            <Drawer.Screen
                name="Transactions"
                component={Transactions}
                options={{
                    title: 'Transacciones',
                    drawerIcon: ({ color, size }) => <Icon name="swap-horizontal-outline" color={color} size={size} />,
                }}
            />
            <Drawer.Screen
                name="Budgets"
                component={Budgets}
                options={{
                    title: 'Presupuestos',
                    drawerIcon: ({ color, size }) => <Icon name="wallet-outline" color={color} size={size} />,
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={Profile}
                options={{
                    title: 'Mi Perfil',
                    drawerIcon: ({ color, size }) => <Icon name="person-outline" color={color} size={size} />,
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={Settings}
                options={{ title: 'Configuración', presentation: 'modal' }}
            />
            <Drawer.Screen name="NotFound" component={NotFound} options={{ title: '404' }} />
        </Drawer.Navigator>
    );
}