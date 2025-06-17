// src/theme.ts
import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';

export const theme = {
    ...DefaultTheme,
    roundness: 8,
    colors: {
        ...DefaultTheme.colors,
        // Colores primarios
        primary: '#6750A4',        // púrpura elegante
        onPrimary: '#ffffff',
        secondary: '#386AEB',      // azul ligeramente más vivo
        onSecondary: '#ffffff',

        // Fondos y superficies
        background: '#F3F2F7',     // gris muy suave
        onBackground: '#1C1B1F',
        surface: '#FFFFFF',
        onSurface: '#1C1B1F',

        // Errores y avisos
        error: '#B3261E',
        onError: '#ffffff',
        warning: '#F2C94C',
        info: '#0288D1',
        success: '#2E7D32',

        // Tonos neutros
        surfaceVariant: '#E7E0EC',
        onSurfaceVariant: '#49454F',
    },
};
