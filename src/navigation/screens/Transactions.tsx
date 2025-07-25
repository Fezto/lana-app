// src/screens/Transactions.tsx
import React, { useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import {
  Surface,
  Text,
  Button,
  Searchbar,
  Card,
  ActivityIndicator,
  useTheme,
  Portal,
  Modal,
  FAB,
  Chip,
  Dialog,
  IconButton,
  Menu,
  SegmentedButtons,
} from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { useListTransactions, useDeleteTransaction } from "@api/transactions";
import { useListCategories } from "@api/categories";
import { useAuth } from "@hooks/useAuth";
import { TransactionForm } from "../../forms/TransactionForm";
import type { TransactionRead } from "@api/schemas";

export function Transactions() {
  const theme = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<TransactionRead | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    useState<TransactionRead | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "completed" | "failed"
  >("all");
  const [menuVisible, setMenuVisible] = useState<{ [key: number]: boolean }>(
    {}
  );

  const {
    data: transactions,
    isLoading,
    error,
    refetch,
  } = useListTransactions(
    {},
    {
      query: {
        retry: 2,
        refetchOnWindowFocus: false,
        enabled: !!user,
      },
    }
  );

  const { data: categories } = useListCategories({
    query: {
      enabled: !!user,
    },
  });

  const deleteTransactionMutation = useDeleteTransaction();

  // Crear un mapa de categorías para mostrar nombres en lugar de IDs
  const categoryMap =
    categories?.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<number, any>) || {};

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Formatear estado para mostrar
  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      pending: "Pendiente",
      completed: "Completada",
      failed: "Fallida",
    };
    return statuses[status] || status;
  };

  const filteredTransactions =
    transactions?.filter((transaction) => {
      const category = categoryMap[transaction.category_id];
      const categoryName =
        category?.name || `Categoría ${transaction.category_id}`;
      const description = transaction.description || "";

      // Filtro por texto
      const textMatch =
        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro por tipo
      let typeMatch = true;
      if (filterType !== "all") {
        const categoryType = category?.type;
        typeMatch = categoryType === filterType;
      }

      // Filtro por estado
      let statusMatch = true;
      if (filterStatus !== "all") {
        statusMatch = transaction.status === filterStatus;
      }

      return textMatch && typeMatch && statusMatch;
    }) || [];

  const renderTransaction = ({ item }: { item: TransactionRead }) => {
    const category = categoryMap[item.category_id];
    const categoryName = category?.name || `Categoría ${item.category_id}`;
    const categoryType = category?.type;
    const isIncome = categoryType === "income";

    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <View style={styles.titleRow}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {categoryName}
                </Text>
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() =>
                    setMenuVisible((prev) => ({ ...prev, [item.id]: true }))
                  }
                  style={styles.menuButton}
                />
              </View>
              {item.description && (
                <Text variant="bodyMedium" style={styles.description}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.transactionDetails}>
            <View style={styles.amountSection}>
              <Text
                variant="titleLarge"
                style={[
                  styles.amount,
                  {
                    color: isIncome ? theme.colors.primary : theme.colors.error,
                  },
                ]}
              >
                {isIncome ? "+" : "-"}$
                {parseFloat(item.amount.toString()).toFixed(2)}
              </Text>
            </View>

            <View style={styles.metaInfo}>
              <View style={styles.chipContainer}>
                <Chip
                  mode="outlined"
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: isIncome
                        ? theme.colors.primaryContainer
                        : theme.colors.errorContainer,
                    },
                  ]}
                  textStyle={{
                    color: isIncome
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onErrorContainer,
                  }}
                >
                  {isIncome ? "Ingreso" : "Gasto"}
                </Chip>
                <Chip
                  mode="outlined"
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        item.status === "completed"
                          ? theme.colors.primaryContainer
                          : item.status === "failed"
                          ? theme.colors.errorContainer
                          : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  {formatStatus(item.status)}
                </Chip>
              </View>
              <Text variant="bodySmall" style={styles.dateText}>
                📅 {formatDate(item.date)}
              </Text>
            </View>
          </View>

          {/* Menu contextual */}
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() =>
              setMenuVisible((prev) => ({ ...prev, [item.id]: false }))
            }
            anchor={<View />}
            anchorPosition="bottom"
          >
            <Menu.Item
              onPress={() => {
                setTransactionToEdit(item);
                setModalVisible(true);
                setMenuVisible((prev) => ({ ...prev, [item.id]: false }));
              }}
              title="Editar"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                handleDeleteTransaction(item);
                setMenuVisible((prev) => ({ ...prev, [item.id]: false }));
              }}
              title="Eliminar"
              leadingIcon="delete"
              titleStyle={{ color: theme.colors.error }}
            />
          </Menu>
        </Card.Content>
      </Card>
    );
  };

  const handleTransactionAdded = () => {
    setModalVisible(false);
    setTransactionToEdit(null);
    // Invalidar tanto transacciones como categorías para refrescar la data
    queryClient.invalidateQueries({ queryKey: ["/transactions/"] });
    queryClient.invalidateQueries({ queryKey: ["/categories/"] });
  };

  const handleDeleteTransaction = (transaction: TransactionRead) => {
    setTransactionToDelete(transaction);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransactionMutation.mutateAsync({
        transactionId: transactionToDelete.id,
      });

      // Invalidar queries para refrescar la data
      queryClient.invalidateQueries({ queryKey: ["/transactions/"] });

      setDeleteDialogVisible(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const cancelDeleteTransaction = () => {
    setDeleteDialogVisible(false);
    setTransactionToDelete(null);
  };

  const typeFilterOptions = [
    { value: "all", label: "Todos" },
    { value: "income", label: "Ingresos" },
    { value: "expense", label: "Gastos" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "Todos" },
    { value: "completed", label: "Completadas" },
    { value: "pending", label: "Pendientes" },
    { value: "failed", label: "Fallidas" },
  ];

  if (isLoading) {
    return (
      <Surface
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando transacciones...</Text>
      </Surface>
    );
  }

  if (error) {
    return (
      <Surface
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
          Error al cargar transacciones
        </Text>
        <Button
          mode="outlined"
          onPress={() => refetch()}
          style={{ marginTop: 16 }}
        >
          Reintentar
        </Button>
      </Surface>
    );
  }

  return (
    <Surface
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <Text variant="labelLarge" style={styles.filterLabel}>
          Tipo:
        </Text>
        <SegmentedButtons
          value={filterType}
          onValueChange={(value) => setFilterType(value as any)}
          buttons={typeFilterOptions}
          style={styles.filterButtons}
        />

        <Text variant="labelLarge" style={styles.filterLabel}>
          Estado:
        </Text>
        <SegmentedButtons
          value={filterStatus}
          onValueChange={(value) => setFilterStatus(value as any)}
          buttons={statusFilterOptions}
          style={styles.filterButtons}
        />
      </View>

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
            {searchQuery || filterType !== "all" || filterStatus !== "all"
              ? "No se encontraron transacciones"
              : "No tienes transacciones"}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtext, { opacity: 0.7 }]}
          >
            {searchQuery || filterType !== "all" || filterStatus !== "all"
              ? "Intenta con otros filtros o términos de búsqueda"
              : "Crea tu primera transacción usando el botón de abajo"}
          </Text>
        </View>
      )}

      {/* FAB para añadir transacción */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {
          setTransactionToEdit(null);
          setModalVisible(true);
        }}
        label="Añadir Transacción"
      />

      {/* Modal para el formulario */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setTransactionToEdit(null);
          }}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {transactionToEdit ? "Editar Transacción" : "Nueva Transacción"}
          </Text>
          <TransactionForm
            transaction={transactionToEdit}
            onSuccess={handleTransactionAdded}
            onCancel={() => {
              setModalVisible(false);
              setTransactionToEdit(null);
            }}
          />
        </Modal>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={cancelDeleteTransaction}
        >
          <Dialog.Title>Eliminar Transacción</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que quieres eliminar esta transacción?
            </Text>
            {transactionToDelete && (
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, fontWeight: "bold" }}
              >
                {categoryMap[transactionToDelete.category_id]?.name ||
                  `Categoría ${transactionToDelete.category_id}`}{" "}
                - $
                {parseFloat(transactionToDelete.amount.toString()).toFixed(2)}
              </Text>
            )}
            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDeleteTransaction}>Cancelar</Button>
            <Button
              onPress={confirmDeleteTransaction}
              loading={deleteTransactionMutation.isPending}
              textColor={theme.colors.error}
            >
              Eliminar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    marginBottom: 8,
    marginTop: 8,
  },
  filterButtons: {
    marginBottom: 8,
  },
  searchbar: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100, // Espacio para el FAB
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryName: {
    flex: 1,
    fontWeight: "bold",
  },
  menuButton: {
    margin: 0,
  },
  description: {
    opacity: 0.7,
    fontStyle: "italic",
    marginTop: 4,
  },
  transactionDetails: {
    gap: 12,
  },
  amountSection: {
    alignItems: "center",
  },
  amount: {
    fontWeight: "bold",
    fontSize: 24,
  },
  metaInfo: {
    gap: 8,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  typeChip: {
    minWidth: 70,
  },
  statusChip: {
    minWidth: 80,
  },
  dateText: {
    textAlign: "center",
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: "90%",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
});
