import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuth } from "@hooks/useAuth";
import { useCategoryBalances } from "@hooks/useCategoryBalances";
import { useTransactions } from "../../hooks/useTransactions"; // Hook para obtener transacciones reales

export function Home() {
    const theme = useTheme();
    const { user, isLoading: isAuthLoading, error: authError } = useAuth();
    const { summary, overBudgetCategories, warningCategories } = useCategoryBalances();
    const { recentTransactions } = useTransactions();

    // Frases motivacionales por semana
    const motivationalPhrases = [
        "¡Sigue adelante, estás haciendo un gran trabajo!",
        "El éxito financiero es el resultado de pequeños pasos diarios.",
        "Cada decisión cuenta, ¡haz que valga la pena!",
        "El control de tus finanzas está en tus manos.",
        "¡Hoy es un buen día para ahorrar!",
    ];
    const getWeek = (date: Date) => {
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
        return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    };
    const currentWeek = getWeek(new Date()); // Obtener la semana actual
    const motivationalPhrase = motivationalPhrases[currentWeek % motivationalPhrases.length];

    // Mostrar indicador de carga si los datos están cargando
    if (isAuthLoading) {
        return (
            <Surface style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" />
            </Surface>
        );
    }

    // Mostrar errores si ocurren
    if (authError) {
        return (
            <Surface style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                    {`Error: ${String(authError) ?? 'Error desconocido'}`}
                </Text>
            </Surface>
        );
    }

    return (
        <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Bienvenida */}
            <Surface style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text variant="headlineSmall" style={[styles.headerText, { color: theme.colors.onPrimaryContainer }]}>
                    Bienvenido, {user?.first_name || "Usuario"}
                </Text>
                <Text variant="bodyMedium" style={[styles.motivationalText, { color: theme.colors.onPrimaryContainer }]}>
                    {motivationalPhrase}
                </Text>
            </Surface>

            {/* Ingresos Totales */}
            <Surface style={[styles.incomeCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="headlineMedium" style={[styles.incomeText, { color: theme.colors.primary }]}>
                    ${summary.totalBudget.toFixed(2)}
                </Text>
                <Text variant="bodyMedium" style={[styles.incomeLabel, { color: theme.colors.onSurface }]}>
                    Ingresos Totales
                </Text>
            </Surface>

            {/* Transacciones Recientes */}
            <Surface style={[styles.transactionsCard, { backgroundColor: theme.colors.surface }]}>
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Transacciones Recientes
                </Text>
                {recentTransactions.map((transaction) => (
                    <View key={transaction.id} style={styles.transactionRow}>
                        <Text variant="bodyMedium" style={styles.transactionLabel}>
                            {transaction.description || "Sin descripción"}
                        </Text>
                        <Text
                            variant="bodyMedium"
                            style={[
                                styles.transactionValue,
                                { color: transaction.amount < 0 ? theme.colors.error : theme.colors.primary },
                            ]}
                        >
                            {transaction.amount < 0 ? `-$${Math.abs(transaction.amount).toFixed(2)}` : `+$${transaction.amount.toFixed(2)}`}
                        </Text>
                    </View>
                ))}
            </Surface>

            {/* Alertas */}
            <Surface style={[styles.alerts, { backgroundColor: theme.colors.surfaceVariant, flex: 1 }]}>
                {overBudgetCategories.length === 0 && warningCategories.length === 0 ? (
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                        Por ahora no tienes alertas.
                    </Text>
                ) : (
                    <>
                        {overBudgetCategories.length > 0 && (
                            <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                                ⚠️ Tienes {overBudgetCategories.length} categorías sobre presupuesto.
                            </Text>
                        )}
                        {warningCategories.length > 0 && (
                            <Text variant="bodyMedium" style={{ color: theme.colors.tertiary, marginTop: 8 }}>
                                🔔 Tienes {warningCategories.length} categorías en alerta (uso {'>'}80%).
                            </Text>
                        )}
                    </>
                )}
            </Surface>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderRadius: 16, // Aumentar el redondeo
        marginBottom: 16,
    },
    headerText: {
        fontWeight: 'bold',
    },
    motivationalText: {
        marginTop: 8,
        fontStyle: 'italic',
    },
    incomeCard: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        borderRadius: 16, // Aumentar el redondeo
        marginBottom: 16,
        elevation: 2,
    },
    incomeText: {
        fontWeight: 'bold',
        fontSize: 32,
    },
    incomeLabel: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.7,
    },
    transactionsCard: {
        padding: 16,
        borderRadius: 16, // Aumentar el redondeo
        marginBottom: 16,
        elevation: 2,
    },
    transactionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    transactionLabel: {
        fontWeight: '500',
        opacity: 0.8,
    },
    transactionValue: {
        fontWeight: 'bold',
    },
    alerts: {
        padding: 16,
        borderRadius: 16, // Aumentar el redondeo
        marginTop: 16,
    },
});
