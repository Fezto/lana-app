// src/screens/Budgets.tsx
import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
    Surface,
    Text,
    Button,
    Searchbar,
    Card,
    ActivityIndicator,
    useTheme
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useListBudgets } from '@api/budgets';
import type { BudgetRead } from '@api/schemas';

export function Budgets() {
    const navigation = useNavigation<any>();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: budgets, isLoading, error } = useListBudgets(
        undefined,
        {
            query: {
                retry: 2,
                refetchOnWindowFocus: false
            }
        }
    );

    const filteredBudgets = budgets?.filter(budget =>
        budget.category_id?.toString().includes(searchQuery.toLowerCase()) ||
        budget.month_year?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const renderBudget = ({ item }: { item: BudgetRead }) => {
        return (
            <Card style={styles.budgetCard}>
                <Card.Content>
                    <View style={styles.budgetHeader}>
                        <Text variant="titleMedium" style={styles.categoryText}>
                            Categoría:
                        </Text>
                        <Text variant="titleLarge" style={styles.categoryValue}>
                            Categoría {item.category_id}
                        </Text>
                    </View>

                    <View style={styles.limitSection}>
                        <Text variant="titleMedium" style={styles.limitText}>
                            Límite mensual:
                        </Text>
                        <Text
                            variant="titleLarge"
                            style={[styles.limitValue, { color: theme.colors.primary }]}
                        >
                            ${item.amount || '0.00'}
                        </Text>
                    </View>

                    <View style={styles.monthSection}>
                        <Text variant="bodyMedium" style={styles.monthText}>
                            Mes: {item.month_year || 'No especificado'}
                        </Text>
                    </View>
                </Card.Content>
            </Card>
        );
    };

    if (isLoading) {
        return (
            <Surface style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 16 }}>Cargando presupuestos...</Text>
            </Surface>
        );
    }

    if (error) {
        return (
            <Surface style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    Error al cargar presupuestos
                </Text>
            </Surface>
        );
    }

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Botón para añadir presupuesto */}
            <Button
                mode="contained"
                onPress={() => navigation.navigate('AddBudget')}
                style={styles.addButton}
                icon="plus"
            >
                Añadir Presupuesto
            </Button>

            {/* Campo de búsqueda */}
            <Searchbar
                placeholder="Buscar presupuestos..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
            />

            {/* Lista de presupuestos */}
            {filteredBudgets.length > 0 ? (
                <FlatList
                    data={filteredBudgets}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderBudget}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Text variant="bodyLarge" style={styles.emptyText}>
                        {searchQuery ? 'No se encontraron presupuestos' : 'No tienes presupuestos aún'}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.emptyText, { marginTop: 8 }]}>
                        Crea tu primer presupuesto usando el botón de arriba
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
    budgetCard: {
        marginBottom: 12,
    },
    budgetHeader: {
        marginBottom: 12,
    },
    categoryText: {
        opacity: 0.7,
        marginBottom: 4,
    },
    categoryValue: {
        fontWeight: 'bold',
    },
    limitSection: {
        marginBottom: 12,
    },
    limitText: {
        opacity: 0.7,
        marginBottom: 4,
    },
    limitValue: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    monthSection: {
        marginTop: 8,
    },
    monthText: {
        opacity: 0.8,
        fontStyle: 'italic',
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