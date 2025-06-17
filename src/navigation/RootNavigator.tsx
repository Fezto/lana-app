// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerNavigator }   from './DrawerNavigator';
import { LoginScreen }       from '@screens/Login';
import { RegisterScreen }    from '@screens/Register';

const Stack = createNativeStackNavigator();

export function RootNavigator(props) {
    return (
        <NavigationContainer {...props}>
            <Stack.Navigator  screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login"    component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="App"      component={DrawerNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
