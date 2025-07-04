// src/hooks/useAuth.ts
import { useGetCurrentUser } from '@api/users';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';

export function useAuth() {
    const queryClient = useQueryClient();
    const { data: user, isLoading, error } = useGetCurrentUser({
        query: { retry: false },
    });

    async function logout() {
        await AsyncStorage.multiRemove(['access_token','refresh_token']);
        queryClient.clear();
    }

    return { user, isLoading, error, logout };
}
