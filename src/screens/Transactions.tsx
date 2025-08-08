import React, { useState } from "react";
import { StyleSheet, View, FlatList, Alert } from "react-native";
import {
  Text,
  Card,
  FAB,
  Searchbar,
  Button,
  useTheme,
  Portal,
  Modal,
  SegmentedButtons,
  Menu,
  IconButton,
  Chip,
} from "react-native-paper";
import { useListTransactions, useDeleteTransaction } from "@api/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { TransactionForm } from "@forms/TransactionForm";
import type { TransactionRead } from "@api/schemas";

type FilterType = "all";
type StatusFilter = "all" | "pending" | "completed" | "failed";

export function Transactions() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Estados
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionRead | null>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [menuVisible, setMenuVisible] = useState(false);

  // API
  const { data: transactions, isLoading } = useListTransactions();

  const deleteTransactionMutation = useDeleteTransaction();

  // Filtrar transacciones
  const filteredTransactions =
    transactions?.filter((transaction) => {
      const matchesSearch = transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || transaction.status === statusFilter;

      return matchesSearch && matchesStatus;
    }) || [];

  const handleEdit = (transaction: TransactionRead) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    setMenuVisible(false);
  };

  const handleDelete = (transaction: TransactionRead) => {
    setMenuVisible(false);
    Alert.alert(
      "Eliminar Transacción",
      `¿Estás seguro de que quieres eliminar esta transacción?${
        transaction.description ? `\n\n"${transaction.description}"` : ""
      }`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransactionMutation.mutateAsync({
                transactionId: transaction.id,
              });
              queryClient.invalidateQueries({ queryKey: ["transactions"] });
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "No se pudo eliminar la transacción");
            }
          },
        },
      ]
    );
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTransaction(null);
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const formattedAmount = `$${absAmount.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    if (amount > 0) {
      return `+${formattedAmount}`;
    } else {
      return `-${formattedAmount}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return theme.colors.primary;
      case "pending":
        return theme.colors.secondary;
      case "failed":
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallida";
      default:
        return status;
    }
  };

  const typeFilterOptions = [
    { value: "all", label: "Todas" },
    { value: "income", label: "Ingresos" },
    { value: "expense", label: "Gastos" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "Todos" },
    { value: "completed", label: "Completadas" },
    { value: "pending", label: "Pendientes" },
    { value: "failed", label: "Fallidas" },
  ];

  const renderTransaction = ({
    item: transaction,
  }: {
    item: TransactionRead;
  }) => (
    <Card style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text variant="titleMedium" style={styles.transactionTitle}>
              Categoría ID: {transaction.category_id}
            </Text>
            {transaction.description && (
              <Text variant="bodyMedium" style={styles.transactionDescription}>
                {transaction.description}
              </Text>
            )}
            <Text variant="bodySmall" style={styles.transactionDate}>
              {new Date(transaction.date).toLocaleDateString("es-MX")}
            </Text>
          </View>

          <View style={styles.transactionActions}>
            <Text
              variant="titleLarge"
              style={[
                styles.transactionAmount,
                {
                  color:
                    transaction.amount > 0
                      ? theme.colors.primary
                      : theme.colors.error,
                },
              ]}
            >
              {formatAmount(transaction.amount)}
            </Text>

            <Menu
              visible={menuVisible && selectedTransactionId === transaction.id}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => {
                    setSelectedTransactionId(transaction.id);
                    setMenuVisible(true);
                  }}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEdit(transaction)}
                title="Editar"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => handleDelete(transaction)}
                title="Eliminar"
                leadingIcon="delete"
              />
            </Menu>
          </View>
        </View>

        <View style={styles.transactionFooter}>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(transaction.status) },
            ]}
            textStyle={{ color: "white" }}
          >
            {getStatusLabel(transaction.status)}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  if (showForm) {
    return (
      <Portal>
        <Modal
          visible={showForm}
          onDismiss={handleFormCancel}
          contentContainerStyle={styles.modalContainer}
        >
          <TransactionForm
            transaction={editingTransaction}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Modal>
      </Portal>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar transacciones..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filtersContainer}>
        
        <Text variant="labelMedium" style={styles.filterLabel}>
          Tipo:
        </Text>
        <SegmentedButtons
          value={typeFilter}
          onValueChange={(value) => setTypeFilter(value as FilterType)}
          buttons={typeFilterOptions}
          style={styles.segmentedButtons}
        />
       

        <Text variant="labelMedium" style={styles.filterLabel}>
          Estado:
        </Text>
        <SegmentedButtons
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          buttons={statusFilterOptions}
          style={styles.segmentedButtons}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <Text>Cargando transacciones...</Text>
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View style={styles.centerContent}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery || statusFilter !== "all"
              ? "No se encontraron transacciones con los filtros aplicados"
              : "No tienes transacciones registradas"}
          </Text>
          {!searchQuery && statusFilter === "all" && (
            <Button
              mode="contained"
              onPress={() => setShowForm(true)}
              style={styles.createButton}
            >
              Crear primera transacción
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB icon="plus" style={styles.fab} onPress={() => setShowForm(true)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchbar: {
    margin: 16,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  transactionDescription: {
    marginBottom: 4,
    opacity: 0.8,
  },
  transactionDate: {
    opacity: 0.6,
  },
  transactionActions: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  transactionFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  statusChip: {
    marginRight: 8,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 16,
    opacity: 0.7,
  },
  createButton: {
    marginTop: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: "90%",
  },
});
