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
import {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryTheme,
  VictoryPie,
  VictoryBar,
  VictoryContainer,
} from "victory-native";
import { useAuth } from "@hooks/useAuth";
import {
  useGetIncomeExpenseReport,
  useGetByCategoryReport,
  useGetTrendReport,
} from "@api/reports";

const screenWidth = Dimensions.get("window").width;

export function Reports() {
  const theme = useTheme();
  const { user } = useAuth();

  const [reportType, setReportType] = useState<
    "income-expense" | "category" | "trends"
  >("income-expense");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [categoryType, setCategoryType] = useState<"income" | "expense" | null>(
    null
  );
  const [granularity, setGranularity] = useState<
    "daily" | "weekly" | "monthly"
  >("monthly");

  // Queries para los diferentes reportes
  const {
    data: incomeExpenseData,
    isLoading: incomeExpenseLoading,
    error: incomeExpenseError,
  } = useGetIncomeExpenseReport(
    { start_date: dateRange.startDate, end_date: dateRange.endDate },
    {
      query: {
        enabled: !!user && reportType === "income-expense",
      },
    }
  );

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetByCategoryReport(
    {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      type: categoryType || undefined,
    },
    {
      query: {
        enabled: !!user && reportType === "category",
      },
    }
  );

  const {
    data: trendsData,
    isLoading: trendsLoading,
    error: trendsError,
  } = useGetTrendReport(
    {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      granularity: granularity,
    },
    {
      query: {
        enabled: !!user && reportType === "trends",
      },
    }
  );

  const reportTypeOptions = [
    { value: "income-expense", label: "Ingresos vs Gastos" },
    { value: "category", label: "Por Categoría" },
    { value: "trends", label: "Tendencias" },
  ];

  const categoryTypeOptions = [
    { value: "all", label: "Todos" },
    { value: "income", label: "Ingresos" },
    { value: "expense", label: "Gastos" },
  ];

  const granularityOptions = [
    { value: "daily", label: "Diario" },
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensual" },
  ];

  const chartConfig = {
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(${theme.colors.primary}, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderIncomeExpenseChart = () => {
    if (incomeExpenseLoading) {
      return <ActivityIndicator size="large" style={styles.loading} />;
    }

    if (incomeExpenseError || !incomeExpenseData?.items?.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay datos para mostrar en el período seleccionado
        </Text>
      );
    }

    const data = {
      labels: incomeExpenseData.items.map((item) => item.period),
      datasets: [
        {
          data: incomeExpenseData.items.map((item) =>
            parseFloat(item.income.toString())
          ),
          color: () => theme.colors.primary,
          strokeWidth: 2,
        },
        {
          data: incomeExpenseData.items.map((item) =>
            parseFloat(item.expense.toString())
          ),
          color: () => theme.colors.error,
          strokeWidth: 2,
        },
      ],
      legend: ["Ingresos", "Gastos"],
    };

    // Preparar datos para gifted-charts
    const lineData = incomeExpenseData.items.map((item, index) => ({
      value: parseFloat(item.income.toString()),
      dataPointText: `$${parseFloat(item.income.toString()).toFixed(0)}`,
      label: item.period,
    }));

    const lineData2 = incomeExpenseData.items.map((item, index) => ({
      value: parseFloat(item.expense.toString()),
      dataPointText: `$${parseFloat(item.expense.toString()).toFixed(0)}`,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Ingresos vs Gastos
        </Text>
        <View style={styles.simpleChart}>
          {incomeExpenseData.items.slice(0, 6).map((item, index) => {
            const income = parseFloat(item.income.toString());
            const expense = parseFloat(item.expense.toString());
            const maxValue = Math.max(income, expense);
            const incomeHeight = maxValue > 0 ? (income / maxValue) * 150 : 0;
            const expenseHeight = maxValue > 0 ? (expense / maxValue) * 150 : 0;

            return (
              <View key={index} style={styles.barGroup}>
                <Text variant="bodySmall" style={styles.barLabel}>
                  {item.period}
                </Text>
                <View style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: incomeHeight,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.barValue}>
                      ${income.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: expenseHeight,
                          backgroundColor: theme.colors.error,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.barValue}>
                      ${expense.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text variant="bodySmall">Ingresos</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: theme.colors.error },
              ]}
            />
            <Text variant="bodySmall">Gastos</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCategoryChart = () => {
    if (categoryLoading) {
      return <ActivityIndicator size="large" style={styles.loading} />;
    }

    if (categoryError || !categoryData?.items?.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay datos para mostrar en el período seleccionado
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

    const pieData = categoryData.items.map((item, index) => ({
      name: item.category_name,
      population: parseFloat(item.total.toString()),
      color: colors[index % colors.length],
      legendFontColor: theme.colors.onSurface,
      legendFontSize: 12,
    }));

    // Preparar datos para PieChart de gifted-charts
    const pieChartData = categoryData.items.map((item, index) => ({
      value: parseFloat(item.total.toString()),
      color: colors[index % colors.length],
      text: `$${parseFloat(item.total.toString()).toFixed(0)}`,
      label: item.category_name,
    }));

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Gastos por Categoría
        </Text>
        <View style={styles.pieChartContainer}>
          {pieChartData.slice(0, 6).map((item, index) => (
            <View key={index} style={[styles.pieItem, { backgroundColor: item.color + '20' }]}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              />
              <View style={styles.pieItemText}>
                <Text variant="bodyMedium" numberOfLines={1}>
                  {item.label}
                </Text>
                <Text variant="bodySmall" style={styles.pieItemValue}>
                  ${parseFloat(item.value.toString()).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTrendsChart = () => {
    if (trendsLoading) {
      return <ActivityIndicator size="large" style={styles.loading} />;
    }

    if (trendsError || !trendsData?.items?.length) {
      return (
        <Text variant="bodyMedium" style={styles.noData}>
          No hay datos para mostrar en el período seleccionado
        </Text>
      );
    }

    const data = {
      labels: trendsData.items.slice(0, 6).map((item) => item.period),
      datasets: [
        {
          data: trendsData.items
            .slice(0, 6)
            .map((item) => parseFloat(item.total.toString())),
        },
      ],
    };

    // Preparar datos para BarChart de gifted-charts
    const barData = trendsData.items.slice(0, 6).map((item, index) => ({
      value: parseFloat(item.total.toString()),
      label: item.period,
      frontColor: theme.colors.primary,
      gradientColor: theme.colors.primaryContainer,
      spacing: 2,
      labelWidth: 50,
      labelTextStyle: { fontSize: 10 },
    }));

    return (
      <View style={styles.chartContainer}>
        <Text variant="titleMedium" style={styles.chartTitle}>
          Tendencias por Período
        </Text>
        <View style={styles.simpleChart}>
          {barData.slice(0, 6).map((item, index) => {
            const maxValue = Math.max(...barData.map((bar) => bar.value));
            const height = maxValue > 0 ? (item.value / maxValue) * 150 : 0;

            return (
              <View key={index} style={styles.barGroup}>
                <Text variant="bodySmall" style={styles.barLabel}>
                  {item.label}
                </Text>
                <View style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: height,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                    <Text variant="bodySmall" style={styles.barValue}>
                      ${item.value.toFixed(0)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de tipo de reporte */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tipo de Reporte
            </Text>
            <SegmentedButtons
              value={reportType}
              onValueChange={(value) => setReportType(value as any)}
              buttons={reportTypeOptions}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Selector de fechas */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Período
            </Text>
            <View style={styles.dateContainer}>
              <TextInput
                label="Fecha inicio"
                value={dateRange.startDate}
                onChangeText={(text) =>
                  setDateRange((prev) => ({ ...prev, startDate: text }))
                }
                mode="outlined"
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                label="Fecha fin"
                value={dateRange.endDate}
                onChangeText={(text) =>
                  setDateRange((prev) => ({ ...prev, endDate: text }))
                }
                mode="outlined"
                style={styles.dateInput}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Controles específicos por tipo de reporte */}
        {reportType === "category" && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tipo de Transacción
              </Text>
              <SegmentedButtons
                value={categoryType || "all"}
                onValueChange={(value) =>
                  setCategoryType(value === "all" ? null : (value as any))
                }
                buttons={categoryTypeOptions}
                style={styles.segmentedButtons}
              />
            </Card.Content>
          </Card>
        )}

        {reportType === "trends" && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Granularidad
              </Text>
              <SegmentedButtons
                value={granularity}
                onValueChange={(value) => setGranularity(value as any)}
                buttons={granularityOptions}
                style={styles.segmentedButtons}
              />
            </Card.Content>
          </Card>
        )}

        {/* Gráfica */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {reportType === "income-expense" && "Ingresos vs Gastos"}
              {reportType === "category" && "Gastos por Categoría"}
              {reportType === "trends" && "Tendencia de Transacciones"}
            </Text>
            <View style={styles.chartContainer}>
              {reportType === "income-expense" && renderIncomeExpenseChart()}
              {reportType === "category" && renderCategoryChart()}
              {reportType === "trends" && renderTrendsChart()}
            </View>
          </Card.Content>
        </Card>

        {/* Resumen de datos */}
        {reportType === "income-expense" && incomeExpenseData?.items && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Resumen del Período
              </Text>
              {incomeExpenseData.items.map((item, index) => (
                <View key={index} style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryPeriod}>
                    {item.period}
                  </Text>
                  <View style={styles.summaryAmounts}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.summaryAmount,
                        { color: theme.colors.primary },
                      ]}
                    >
                      Ingresos: ${parseFloat(item.income.toString()).toFixed(2)}
                    </Text>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.summaryAmount,
                        { color: theme.colors.error },
                      ]}
                    >
                      Gastos: ${parseFloat(item.expense.toString()).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  dateContainer: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  chartContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  loading: {
    marginVertical: 40,
  },
  noData: {
    textAlign: "center",
    marginVertical: 40,
    opacity: 0.7,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryPeriod: {
    fontWeight: "bold",
  },
  summaryAmounts: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  summaryAmount: {
    fontSize: 12,
  },
  chartPlaceholder: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chartDescription: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  chartTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
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
    fontSize: 10,
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
    fontSize: 8,
    marginTop: 4,
    textAlign: "center",
  },
  pieChartContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  pieItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pieItemText: {
    marginLeft: 12,
    flex: 1,
  },
  pieItemValue: {
    fontWeight: "bold",
  },
});
