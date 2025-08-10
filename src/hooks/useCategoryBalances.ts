// src/hooks/useCategoryBalances.ts
import { useMemo } from 'react';
import { useListBudgets } from '@api/budgets';
import { useListTransactions } from '@api/transactions';
import { useListRecurringPayments } from '@api/recurring-payments';
import { useListCategories } from '@api/categories';

interface CategoryBalance {
  categoryId: number;
  categoryName: string;
  categoryType: 'income' | 'expense';
  
  // Presupuesto
  budgetAmount: number;
  
  // Transacciones
  transactionTotal: number;
  
  // Pagos recurrentes (calculado por frecuencia)
  recurringTotal: number;
  
  // Balance final
  availableBalance: number;
  usedPercentage: number;
  
  // Estado
  isOverBudget: boolean;
}

export function useCategoryBalances(monthYear?: string) {
  const currentMonthYear = monthYear || new Date().toISOString().slice(0, 7);
  
  // Obtener datos
  const { data: budgets } = useListBudgets({ month_year: currentMonthYear });
  const { data: transactions } = useListTransactions();
  const { data: recurringPayments } = useListRecurringPayments();
  const { data: categories } = useListCategories();

  const categoryBalances = useMemo(() => {
    if (!budgets || !transactions || !recurringPayments || !categories) {
      return [];
    }

    // Crear mapa de categorías
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<number, any>);

    // Procesar cada presupuesto
    const balances: CategoryBalance[] = budgets.map(budget => {
      const category = categoryMap[budget.category_id];
      if (!category) return null;

      // 1. Monto del presupuesto
      const budgetAmount = parseFloat(budget.amount?.toString() || '0');

      // 2. Calcular total de transacciones para esta categoría en el mes
      const categoryTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionMonthYear = transactionDate.toISOString().slice(0, 7);
        return transaction.category_id === budget.category_id && 
               transactionMonthYear === currentMonthYear;
      });

      const transactionTotal = categoryTransactions.reduce((sum, transaction) => {
        const amount = parseFloat(transaction.amount?.toString() || '0');
        // Para gastos restamos, para ingresos sumamos
        return category.type === 'expense' ? sum + amount : sum - amount;
      }, 0);

      // 3. Calcular total de pagos recurrentes activos para esta categoría
      const categoryRecurringPayments = recurringPayments.filter(payment => 
        payment.category_id === budget.category_id && payment.active
      );

      const recurringTotal = categoryRecurringPayments.reduce((sum, payment) => {
        const amount = parseFloat(payment.amount?.toString() || '0');
        // Calcular cuánto se gasta por mes según la frecuencia
        let monthlyAmount = 0;
        
        switch (payment.frequency) {
          case 'daily':
            monthlyAmount = amount * 30; // Aproximado
            break;
          case 'weekly':
            monthlyAmount = amount * 4.33; // 52 semanas / 12 meses
            break;
          case 'biweekly':
            monthlyAmount = amount * 2.17; // 26 quincenas / 12 meses
            break;
          case 'monthly':
            monthlyAmount = amount;
            break;
          default:
            monthlyAmount = amount;
        }

        return sum + monthlyAmount;
      }, 0);

      // 4. Calcular balance disponible
      let availableBalance: number;
      if (category.type === 'expense') {
        // Para gastos: Presupuesto - Transacciones - Pagos recurrentes
        availableBalance = budgetAmount - transactionTotal - recurringTotal;
      } else {
        // Para ingresos: Presupuesto + Transacciones - Pagos recurrentes
        availableBalance = budgetAmount + transactionTotal - recurringTotal;
      }

      // 5. Calcular porcentaje usado
      const totalUsed = transactionTotal + recurringTotal;
      const usedPercentage = budgetAmount > 0 ? (totalUsed / budgetAmount) * 100 : 0;

      // 6. Determinar si está sobre presupuesto
      const isOverBudget = availableBalance < 0;

      return {
        categoryId: budget.category_id,
        categoryName: category.name,
        categoryType: category.type,
        budgetAmount,
        transactionTotal,
        recurringTotal,
        availableBalance,
        usedPercentage: Math.max(0, usedPercentage),
        isOverBudget,
      } as CategoryBalance;
    }).filter(Boolean) as CategoryBalance[];

    return balances;
  }, [budgets, transactions, recurringPayments, categories, currentMonthYear]);

  // Métricas generales
  const totalBudget = categoryBalances.reduce((sum, balance) => sum + balance.budgetAmount, 0);
  const totalUsed = categoryBalances.reduce((sum, balance) => 
    sum + balance.transactionTotal + balance.recurringTotal, 0);
  const totalAvailable = categoryBalances.reduce((sum, balance) => sum + balance.availableBalance, 0);
  
  const overBudgetCategories = categoryBalances.filter(balance => balance.isOverBudget);
  const healthyCategories = categoryBalances.filter(balance => 
    !balance.isOverBudget && balance.usedPercentage < 80);
  const warningCategories = categoryBalances.filter(balance => 
    !balance.isOverBudget && balance.usedPercentage >= 80);

  return {
    categoryBalances,
    summary: {
      totalBudget,
      totalUsed,
      totalAvailable,
      overBudgetCount: overBudgetCategories.length,
      healthyCount: healthyCategories.length,
      warningCount: warningCategories.length,
    },
    overBudgetCategories,
    healthyCategories,
    warningCategories,
  };
}