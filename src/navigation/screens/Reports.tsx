// src/screens/Reports.tsx
import React, { useState } from "react";
import { StyleSheet, ScrollView, View, Dimensions } from "react-native";
import {
  Surface,
  Text,
  Button,
  Card,
  ActivityIndicator,
  useTheme,
  SegmentedButtons,
  TextInput,
  HelperText,
} from "react-native-paper";
import { useAuth } from "@hooks/useAuth";
import { useCategoryBalances } from "@hooks/useCategoryBalances";

const screenWidth = Dimensions.get("window").width;

export function Reports() {
  const theme = useTheme();
  const { user } = useAuth();

  const [reportType, setReportType] = useState<
    "budget-usage" | "category-balance" | "budget-trends"
  >("budget-usage");
  
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // Usar el hook del dashboard para obtener datos reales
  const { 
    categoryBalances, 
    summary, 
    overBudgetCategories, 
    warningCategories,
    healthyCategories 
  } = useCategoryBalances(currentMonthYear);

  const reportTypeOptions = [
    { value: "budget-usage", label: "Uso de Presupuesto" },
    { value: "category-balance", label: "Balance por Categoría" },
    { value: "budget-trends", label: "Tendencias de Presupuesto" },
  ];

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

  const getPrevMonthName = () => {
    const [year, month] = currentMonthYear.split('-').map(Number);
    const prevDate = new Date(year, month - 2);
    return prevDate.toLocaleDateString('es-ES', { month: 'short' });
  };

  const getNextMonthName = () => {
    const [year, month] = currentMonthYear.split('-').map(Number);
    const nextDate = new Date(year, month);
    return nextDate.toLocaleDateString('es-ES', { month: 'short' });
  };

  const renderBudgetUsageChart = () => {
    if (!categoryBalances.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay presupuestos para mostrar en este período
        </Text>
      );
    }

    const colors = [
      theme.colors.primary,
      theme.colors.secondary,
      theme.colors.tertiary,
      theme.colors.error,
      theme.colors.outline,
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
    ];

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Uso de Presupuesto por Categoría
        </Text>
        
        {/* Gráfica de barras horizontales */}
        <View style={styles.horizontalBarsContainer}>
          {categoryBalances.slice(0, 8).map((balance, index) => {
            const usagePercentage = Math.min(balance.usedPercentage, 100);
            const color = balance.isOverBudget 
              ? theme.colors.error 
              : balance.usedPercentage >= 80 
              ? theme.colors.tertiary 
              : theme.colors.primary;

            return (
              <View key={balance.categoryId} style={styles.horizontalBarRow}>
                <View style={styles.categoryInfo}>
                  <Text variant="bodyMedium" numberOfLines={1} style={styles.categoryLabel}>
                    {balance.categoryName}
                  </Text>
                  <Text variant="bodySmall" style={styles.percentageLabel}>
                    {usagePercentage.toFixed(1)}%
                  </Text>
                </View>
                
                <View style={styles.horizontalBarContainer}>
                  <View style={[styles.horizontalBarBackground]}>
                    <View 
                      style={[
                        styles.horizontalBarFill,
                        { 
                          width: `${usagePercentage}%`,
                          backgroundColor: color,
                        }
                      ]} 
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.amountLabel}>
                    ${(balance.transactionTotal + balance.recurringTotal).toFixed(0)} / ${balance.budgetAmount.toFixed(0)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Leyenda */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
            <Text variant="bodySmall">En buen estado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.tertiary }]} />
            <Text variant="bodySmall">Cerca del límite</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text variant="bodySmall">Sobre presupuesto</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryBalanceChart = () => {
    if (!categoryBalances.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay presupuestos para mostrar en este período
        </Text>
      );
    }

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Balance Disponible por Categoría
        </Text>
        
        <View style={styles.simpleChart}>
          {categoryBalances.slice(0, 6).map((balance, index) => {
            const maxBalance = Math.max(...categoryBalances.map(b => Math.abs(b.availableBalance)));
            const height = maxBalance > 0 ? (Math.abs(balance.availableBalance) / maxBalance) * 150 : 0;
            const isNegative = balance.availableBalance < 0;

            return (
              <View key={balance.categoryId} style={styles.barGroup}>
                <Text variant="bodySmall" style={styles.barLabel} numberOfLines={2}>
                  {balance.categoryName}
                </Text>
                <View style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height,
                          backgroundColor: isNegative ? theme.colors.error : theme.colors.primary,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.barValue}>
                      ${balance.availableBalance.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
            <Text variant="bodySmall">Disponible</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text variant="bodySmall">Sobregiro</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBudgetTrendsChart = () => {
    if (!categoryBalances.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay presupuestos para mostrar en este período
        </Text>
      );
    }

    // Crear gráfica comparativa: Presupuestado vs Gastado vs Disponible
    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Presupuestado vs Gastado vs Disponible
        </Text>
        
        <View style={styles.compareChart}>
          {categoryBalances.slice(0, 5).map((balance, index) => {
            const maxValue = Math.max(
              balance.budgetAmount,
              balance.transactionTotal + balance.recurringTotal,
              Math.abs(balance.availableBalance)
            );
            
            const budgetHeight = maxValue > 0 ? (balance.budgetAmount / maxValue) * 120 : 0;
            const spentHeight = maxValue > 0 ? ((balance.transactionTotal + balance.recurringTotal) / maxValue) * 120 : 0;
            const availableHeight = maxValue > 0 ? (Math.abs(balance.availableBalance) / maxValue) * 120 : 0;

            return (
              <View key={balance.categoryId} style={styles.compareBarGroup}>
                <Text variant="bodySmall" style={styles.compareBarLabel} numberOfLines={2}>
                  {balance.categoryName}
                </Text>
                <View style={styles.compareBarContainer}>
                  {/* Presupuestado */}
                  <View style={styles.compareBarWrapper}>
                    <View
                      style={[
                        styles.compareBar,
                        {
                          height: budgetHeight,
                          backgroundColor: theme.colors.primaryContainer,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.compareBarValue}>
                      ${balance.budgetAmount.toFixed(0)}
                    </Text>
                  </View>
                  
                  {/* Gastado */}
                  <View style={styles.compareBarWrapper}>
                    <View
                      style={[
                        styles.compareBar,
                        {
                          height: spentHeight,
                          backgroundColor: theme.colors.error,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.compareBarValue}>
                      ${(balance.transactionTotal + balance.recurringTotal).toFixed(0)}
                    </Text>
                  </View>

                  {/* Disponible */}
                  <View style={styles.compareBarWrapper}>
                    <View
                      style={[
                        styles.compareBar,
                        {
                          height: availableHeight,
                          backgroundColor: balance.availableBalance >= 0 ? theme.colors.primary : theme.colors.errorContainer,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.compareBarValue}>
                      ${Math.abs(balance.availableBalance).toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primaryContainer }]} />
            <Text variant="bodySmall">Presupuestado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.error }]} />
            <Text variant="bodySmall">Gastado</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
            <Text variant="bodySmall">Disponible</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Navegador de mes */}
        <View style={styles.monthNavigator}>
          <Button
            mode="outlined"
            onPress={() => navigateMonth('prev')}
            style={styles.monthNavButton}
            icon="chevron-left"
            compact
          >
            {getPrevMonthName()}
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
            {getNextMonthName()}
          </Button>
        </View>

        {/* Resumen general */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>
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
                  {summary.overBudgetCount} / {categoryBalances.length}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Selector de tipo de reporte */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tipo de Gráfica
            </Text>
            <SegmentedButtons
              value={reportType}
              onValueChange={(value) => setReportType(value as any)}
              buttons={reportTypeOptions}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Gráfica */}
        <Card style={styles.card}>
          <Card.Content>
            {reportType === "budget-usage" && renderBudgetUsageChart()}
            {reportType === "category-balance" && renderCategoryBalanceChart()}
            {reportType === "budget-trends" && renderBudgetTrendsChart()}
          </Card.Content>
        </Card>

        {/* Estadísticas detalladas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Estadísticas Detalladas
            </Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Categorías Saludables</Text>
                <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                  {healthyCategories.length}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>En Alerta (>80%)</Text>
                <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.tertiary }]}>
                  {warningCategories.length}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>Sobre Presupuesto</Text>
                <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.error }]}>
                  {overBudgetCategories.length}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="bodySmall" style={styles.statLabel}>% Presupuesto Usado</Text>
                <Text variant="titleMedium" style={[styles.statValue, { 
                  color: summary.totalBudget > 0 && (summary.totalUsed / summary.totalBudget) > 0.8 
                    ? theme.colors.error 
                    : theme.colors.primary 
                }]}>
                  {summary.totalBudget > 0 ? ((summary.totalUsed / summary.totalBudget) * 100).toFixed(1) : 0}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  segmentedButtons: {
    marginBottom: 8,
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
  chartContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  chartTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  horizontalBarsContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  horizontalBarRow: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    flex: 1,
    fontWeight: '500',
  },
  percentageLabel: {
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
  horizontalBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  horizontalBarBackground: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  horizontalBarFill: {
    height: '100%',
    borderRadius: 10,
    minWidth: 4,
  },
  amountLabel: {
    minWidth: 90,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '500',
  },
  simpleChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
  },
  barGroup: {
    alignItems: "center",
    flex: 1,
  },
  barLabel: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 11,
    height: 32,
    fontWeight: '500',
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    height: 170,
    justifyContent: "center",
  },
  barWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 170,
    width: 20,
  },
  bar: {
    width: 18,
    borderRadius: 2,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
    fontWeight: '500',
  },
  compareChart: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 5,
  },
  compareBarGroup: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  compareBarLabel: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 10,
    height: 32,
    fontWeight: '500',
  },
  compareBarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    height: 140,
    justifyContent: "center",
  },
  compareBarWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 140,
    width: 20,
    marginHorizontal: 1,
  },
  compareBar: {
    width: 16,
    borderRadius: 2,
    minHeight: 8,
  },
  compareBarValue: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
    fontWeight: '500',
    width: 'auto',
    height: 'auto',
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    maxWidth: 120,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  noData: {
    textAlign: "center",
    marginVertical: 40,
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    opacity: 0.7,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 18,
  },
});