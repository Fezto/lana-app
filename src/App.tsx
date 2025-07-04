// App.tsx

// * Importación obligatoria de React
import React from 'react';

// * Importaciones que nos solicita React Navigation
import '../gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// * Importaciones para React Query
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';

// * Importaciones para los componentes de React Native Paper
import {PaperProvider} from "react-native-paper";
import {theme} from './theme';

// * Importacion de nuestro <RootNavigator> perosonalizado
import {RootNavigator} from "@navigation/RootNavigator";


// * Evita que la pantalla de carga inicial se oculte sola
// * En cambio, se tiene que ocultar con SplashScreen.hideAsync()
SplashScreen.preventAutoHideAsync();

// * Nuestro cliente de React Query!
const queryClient = new QueryClient();

export function App() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>              {/* React Navigation */}
            <PaperProvider theme={theme}>                       {/* React Native Paper */}
                <QueryClientProvider client={queryClient}>      {/* React Query */}

                    {/* <RootNavigator contiene nuestros 2 navegadores: */}
                    {/* 1. un <StackNavigator> para el login / sign up */}
                    {/* 2. un <DrawerNavigator> para el resto */}

                    <RootNavigator linking={{
                        enabled: 'auto',
                        prefixes: ['helloworld://'],
                    }} onReady={() => SplashScreen.hideAsync()}></RootNavigator>

                </QueryClientProvider>
            </PaperProvider>
        </GestureHandlerRootView>
    );
}
