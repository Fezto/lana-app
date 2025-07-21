// src/screens/Transactions.tsx
import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
    Surface,
    Text,
    Button,
    Searchbar,
    Card,
    Chip,
    ActivityIndicator,
    useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useListTransactions } from '@api/transactions';
import type { TransactionRead } from '@api/schemas';

export function Transactions() {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: transactions, isLoading, error } = useListTransactions(
        {},
        {
            query: {
                retry: 2,
                refetchOnWindowFocus: false
            }
        }
    );

    const filteredTransactions = transactions?.filter(transaction =>
        transaction.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const renderTransaction = ({ item }: { item: TransactionRead }) => (
        <Card style={styles.transactionCard}>
            <Card.Content>
                <View style={styles.transactionHeader}>
                    <Text variant="titleMedium" style={styles.transactionTitle}>
                        {item.description || 'Sin descripción'}
                    </Text>
                    <Text
                        variant="titleMedium"
                        style={[
                            styles.amount,
                            { color: item.amount > 0 ? "green" : theme.colors.error }
                        ]}
                    >
                        ${Math.abs(item.amount).toFixed(2)}
                    </Text>
                </View>
                <View style={styles.transactionFooter}>
                    <Text variant="bodyMedium" style={styles.date}>
                        {new Date(item.date).toLocaleDateString('es-ES')}
                    </Text>
                    <Chip
                        mode="outlined"
                    >
                        { item.status }
                    </Chip>
                </View>
            </Card.Content>
        </Card>
    );

    if (isLoading) {
        return (
            <Surface style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 16 }}>Cargando transacciones...</Text>
            </Surface>
        );
    }

    if (error) {
        return (
            <Surface style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    Error al cargar transacciones
                </Text>
            </Surface>
        );
    }

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Botón para añadir transacciones */}
            <Button
                mode="contained"
                onPress={() => navigation.navigate('AddTransaction')}
                style={styles.addButton}
                icon="plus"
            >
                Añadir Transacción
            </Button>

            {/* Campo de búsqueda */}
            <Searchbar
                placeholder="Buscar transacciones..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />

            {/* Lista de transacciones */}
            {filteredTransactions.length > 0 ? (
                <FlatList
                    data={filteredTransactions}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderTransaction}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={styles.emptyText}>
                        {searchQuery ? 'No se encontraron transacciones' : 'No tienes transacciones aún'}
                    </Text>
                </View>
            )}
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    addButton: {
        marginBottom: 16,
    },
    searchbar: {
        marginBottom: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    transactionCard: {
        marginBottom: 12,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    transactionTitle: {
        flex: 1,
        marginRight: 8,
    },
    amount: {
        fontWeight: 'bold',
    },
    transactionFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        opacity: 0.7,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        opacity: 0.7,
    },
});