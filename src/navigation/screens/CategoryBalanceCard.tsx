// src/components/CategoryBalanceCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme, Chip } from 'react-native-paper';

interface CategoryBalance {
  categoryId: number;
  categoryName: string;
  categoryType: 'income' | 'expense';
  budgetAmount: number;
  transactionTotal: number;
  recurringTotal: number;
  availableBalance: number;
  usedPercentage: number;
  isOverBudget: boolean;
}

interface CategoryBalanceCardProps {
  balance: CategoryBalance;
}

export function CategoryBalanceCard({ balance }: CategoryBalanceCardProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    if (balance.isOverBudget) return theme.colors.error;
    if (balance.usedPercentage >= 80) return theme.colors.tertiary;
    return theme.colors.primary;
  };

  const getStatusText = () => {
    if (balance.isOverBudget) return 'Sobre presupuesto';
    if (balance.usedPercentage >= 80) return 'Cerca del límite';
    return 'En buen estado';
  };

  const progressValue = Math.min(balance.usedPercentage / 100, 1);

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.categoryName}>
              {balance.categoryName}
            </Text>
            <Chip 
              mode="outlined" 
              style={[styles.typeChip, { 
                backgroundColor: balance.categoryType === 'income' 
                  ? theme.colors.primaryContainer 
                  : theme.colors.errorContainer 
              }]}
              textStyle={{
                color: balance.categoryType === 'income'
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onErrorContainer,
              }}
            >
              {balance.categoryType === 'income' ? 'Ingreso' : 'Gasto'}
            </Chip>
          </View>
          
          <Chip 
            mode="outlined"
            style={[
            styles.statusChip, 
            { 
                backgroundColor: balance.isOverBudget 
                ? theme.colors.errorContainer 
                : balance.usedPercentage >= 80 
                ? theme.colors.tertiaryContainer
                : theme.colors.primaryContainer
            }
            ]}
            textStyle={{ color: getStatusColor() }}
          >
            {getStatusText()}
          </Chip>
        </View>

        {/* Amounts */}
        <View style={styles.amountsContainer}>
          <View style={styles.amountRow}>
            <Text variant="bodyMedium" style={styles.label}>Presupuesto:</Text>
            <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.primary }]}>
              ${balance.budgetAmount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={styles.sublabel}>Transacciones:</Text>
            <Text variant="bodyMedium" style={styles.subamount}>
              ${balance.transactionTotal.toFixed(2)}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text variant="bodySmall" style={styles.sublabel}>Pagos recurrentes:</Text>
            <Text variant="bodyMedium" style={styles.subamount}>
              ${balance.recurringTotal.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.amountRow, styles.totalRow]}>
            <Text variant="titleSmall" style={styles.label}>Disponible:</Text>
            <Text 
              variant="titleMedium" 
              style={[
                styles.amount, 
                { 
                  color: balance.isOverBudget 
                    ? theme.colors.error 
                    : theme.colors.primary 
                }
              ]}
            >
              ${balance.availableBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <Text variant="bodySmall" style={styles.progressLabel}>
            Usado: {balance.usedPercentage.toFixed(1)}%
          </Text>
          <ProgressBar 
            progress={progressValue}
            color={getStatusColor()}
            style={styles.progressBar}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 8,
  },
  typeChip: {
    minWidth: 70,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  amountsContainer: {
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  label: {
    fontWeight: '500',
  },
  sublabel: {
    opacity: 0.7,
    marginLeft: 16,
  },
  amount: {
    fontWeight: 'bold',
  },
  subamount: {
    opacity: 0.8,
  },
  progressContainer: {
    gap: 8,
  },
  progressLabel: {
    opacity: 0.7,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
});