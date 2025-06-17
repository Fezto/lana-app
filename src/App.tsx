// App.tsx
import '../gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Asset} from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import {theme} from './theme';
import {PaperProvider} from "react-native-paper";
import {RootNavigator} from "@navigation/RootNavigator";

Asset.loadAsync([/*…*/]);
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export function App() {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <PaperProvider theme={theme}>
                <QueryClientProvider client={queryClient}>
                    <RootNavigator></RootNavigator>
                </QueryClientProvider>
            </PaperProvider>
        </GestureHandlerRootView>
    );
}
