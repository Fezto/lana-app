// src/screens/BudgetDashboard.tsx
import React, { useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
  Surface,
  Text,
  Button,
  useTheme,
  Card,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useCategoryBalances } from '@hooks/useCategoryBalances';
import { CategoryBalanceCard } from './CategoryBalanceCard';
import { useAuth } from '@hooks/useAuth';

export function BudgetDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [filterView, setFilterView] = useState<'all' | 'warning' | 'overbudget'>('all');

  const { 
    categoryBalances, 
    summary, 
    overBudgetCategories, 
    warningCategories,
    healthyCategories 
  } = useCategoryBalances(currentMonthYear);

  // Formatear el mes/año para mostrar
  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  };

  // Navegación de meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const [year, month] = currentMonthYear.split('-').map(Number);
    const currentDate = new Date(year, month - 1);

    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const newMonthYear = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, '0')}`;
    setCurrentMonthYear(newMonthYear);
  };

  // Filtrar categorías según la vista seleccionada
  const getFilteredCategories = () => {
    switch (filterView) {
      case 'warning':
        return warningCategories;
      case 'overbudget':
        return overBudgetCategories;
      default:
        return categoryBalances;
    }
  };

  const filteredCategories = getFilteredCategories();

  const filterOptions = [
    { value: 'all', label: `Todas (${categoryBalances.length})` },
    { value: 'warning', label: `Alerta (${warningCategories.length})` },
    { value: 'overbudget', label: `Excedidas (${overBudgetCategories.length})` },
  ];

  if (!user) {
    return (
      <Surface style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando...</Text>
      </Surface>
    );
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header con navegación de mes */}
      <View style={styles.monthNavigator}>
        <Button
        mode="outlined"
        onPress={() => navigateMonth('prev')}
        style={styles.monthNavButton}
        icon="chevron-left"
        compact
        >
        {(() => {
            const [year, month] = currentMonthYear.split('-').map(Number);
            const prevDate = new Date(year, month - 2); // -2 porque month es 1-indexed
            return prevDate.toLocaleDateString('es-ES', { month: 'short' });
        })()}
        </Button>

        <Text variant="headlineSmall" style={styles.monthTitle}>
        {formatMonthYear(currentMonthYear)}
        </Text>

        <Button
        mode="outlined"
        onPress={() => navigateMonth('next')}
        style={styles.monthNavButton}
        icon="chevron-right"
        compact
        >
        {(() => {
            const [year, month] = currentMonthYear.split('-').map(Number);
            const nextDate = new Date(year, month); // month es 1-indexed, así que no restamos
            return nextDate.toLocaleDateString('es-ES', { month: 'short' });
        })()}
        </Button>
      </View>

      {/* Resumen general */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.summaryTitle}>
            Resumen del Mes
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Presupuesto Total
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: theme.colors.primary }]}>
                ${summary.totalBudget.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Total Usado
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { color: theme.colors.error }]}>
                ${summary.totalUsed.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Disponible
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { 
                color: summary.totalAvailable >= 0 ? theme.colors.primary : theme.colors.error 
              }]}>
                ${summary.totalAvailable.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text variant="bodySmall" style={styles.summaryLabel}>
                Categorías en Riesgo
              </Text>
              <Text variant="titleMedium" style={[styles.summaryValue, { 
                color: summary.overBudgetCount > 0 ? theme.colors.error : theme.colors.primary 
              }]}>
                {summary.overBudgetCount}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text variant="labelLarge" style={styles.filterLabel}>
          Ver categorías:
        </Text>
        <SegmentedButtons
          value={filterView}
          onValueChange={(value) => setFilterView(value as any)}
          buttons={filterOptions}
          style={styles.filterButtons}
        />
      </View>

      {/* Lista de categorías */}
      {filteredCategories.length > 0 ? (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.categoryId.toString()}
          renderItem={({ item }) => <CategoryBalanceCard balance={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {filterView === 'all' 
              ? 'No hay presupuestos para este mes'
              : filterView === 'warning'
              ? 'No hay categorías en estado de alerta'
              : 'No hay categorías que excedan el presupuesto'
            }
          </Text>
          <Text variant="bodyMedium" style={[styles.emptySubtext, { opacity: 0.7 }]}>
            {filterView === 'all' 
              ? 'Crea presupuestos para empezar a rastrear tus gastos'
              : 'Esto es bueno, significa que tus finanzas están bajo control'
            }
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
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    minWidth: 40,
  },
  monthTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
  },
  summaryLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
  },
  filterButtons: {
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});