import { useMemo } from 'react';
import { useListTransactions } from '@api/transactions';

interface Transaction {
  id: number;
  description: string; // Descripción de la transacción
  amount: number; // Monto de la transacción
  date: string; // Fecha de la transacción
  category_name: string; // Nombre de la categoría asociada
}

export function useTransactions(monthYear?: string) {
  const currentMonthYear = monthYear || new Date().toISOString().slice(0, 7);

  // Obtener datos de transacciones
  const { data: transactions } = useListTransactions();

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      const transactionMonthYear = transactionDate.toISOString().slice(0, 7);
      return transactionMonthYear === currentMonthYear;
    });
  }, [transactions, currentMonthYear]);

  return {
    transactions: filteredTransactions,
    recentTransactions: filteredTransactions.slice(0, 5), // Las 5 transacciones más recientes
  };
}