// src/screens/Budgets.tsx
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
} from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { useListBudgets, useDeleteBudget } from "@api/budgets";
import { useListCategories } from "@api/categories";
import { useAuth } from "@hooks/useAuth";
import { BudgetForm } from "../../forms/BudgetForm";
import type { BudgetRead } from "@api/schemas";
import { useUpdateCategory } from "@api/categories";
import { EditBudgetForm } from "../../forms/EditBudgetForm";

export function Budgets() {
  const theme = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetRead | null>(null);
  const [currentMonthYear, setCurrentMonthYear] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM formato actual
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetRead | null>(null);

  const {
    data: budgets,
    isLoading,
    error,
    refetch,
  } = useListBudgets(
    { month_year: currentMonthYear },
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

  const deleteBudgetMutation = useDeleteBudget();

  // Crear un mapa de categorías para mostrar nombres en lugar de IDs
  const categoryMap =
    categories?.reduce((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {} as Record<number, any>) || {};

  // Funciones para navegación de meses
  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = currentMonthYear.split("-").map(Number);
    const currentDate = new Date(year, month - 1); // month es 0-indexed

    if (direction === "prev") {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const newMonthYear = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonthYear(newMonthYear);
  };

  // Formatear el mes/año para mostrar
  const formatMonthYear = (monthYear: string) => {
    const [year, month] = monthYear.split("-").map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  const filteredBudgets =
    budgets?.filter((budget) => {
      const category = categoryMap[budget.category_id];
      const categoryName = category?.name || `Categoría ${budget.category_id}`;
      return (
        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        budget.month_year?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  const renderBudget = ({ item }: { item: BudgetRead }) => {
    const category = categoryMap[item.category_id];
    const categoryName = category?.name || `Categoría ${item.category_id}`;
    const categoryType = category?.type;

    return (
      <Card style={styles.budgetCard}>
        <Card.Content>
          <View style={styles.budgetHeader}>
            <View style={styles.categorySection}>
              <Text variant="titleMedium" style={styles.categoryName}>
                {categoryName}
              </Text>
              <View style={styles.categoryActions}>
                {categoryType && (
                  <Chip
                    mode="outlined"
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor:
                          categoryType === "income"
                            ? theme.colors.primaryContainer
                            : theme.colors.errorContainer,
                      },
                    ]}
                    textStyle={{
                      color:
                        categoryType === "income"
                          ? theme.colors.onPrimaryContainer
                          : theme.colors.onErrorContainer,
                    }}
                  >
                    {categoryType === "income" ? "Ingreso" : "Gasto"}
                  </Chip>
                )}
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={() => handleDeleteBudget(item)}
                  style={styles.deleteButton}
                />
                <IconButton
                  icon="pencil"
                  size={20}
                  iconColor={theme.colors.primary}
                  onPress={() => handleEditBudget(item)}
                  style={styles.editButton}
                />
              </View>
            </View>
          </View>

          <View style={styles.limitSection}>
            <Text variant="titleMedium" style={styles.limitText}>
              Presupuesto mensual:
            </Text>
            <Text
              variant="titleLarge"
              style={[styles.limitValue, { color: theme.colors.primary }]}
            >
              ${parseFloat(item.amount || "0").toFixed(2)}
            </Text>
          </View>

          <View style={styles.monthSection}>
            <Text variant="bodyMedium" style={styles.monthText}>
              📅 {item.month_year || "No especificado"}
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handleBudgetAdded = () => {
    setModalVisible(false);
    // Invalidar tanto presupuestos como categorías para refrescar la data
    queryClient.invalidateQueries({ queryKey: ["/budgets/"] });
    queryClient.invalidateQueries({ queryKey: ["/categories/"] });
  };

  const handleBudgetUpdated = () => {
  setEditModalVisible(false);
  setBudgetToEdit(null);
  queryClient.invalidateQueries({ queryKey: ["/budgets/"] });
  queryClient.invalidateQueries({ queryKey: ["/categories/"] });
};

  const handleEditBudget = (budget: BudgetRead) => {
    setBudgetToEdit(budget);
    setEditModalVisible(true);
  };

  const cancelEditBudget = () => {
    setEditModalVisible(false);
    setBudgetToEdit(null);
  };

  const handleDeleteBudget = (budget: BudgetRead) => {
    setBudgetToDelete(budget);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteBudget = async () => {
    if (!budgetToDelete) return;

    try {
      await deleteBudgetMutation.mutateAsync({ budgetId: budgetToDelete.id });

      // Invalidar queries para refrescar la data
      queryClient.invalidateQueries({ queryKey: ["/budgets/"] });

      setDeleteDialogVisible(false);
      setBudgetToDelete(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
      // Aquí podrías mostrar un snackbar de error si quieres
    }
  };

  const cancelDeleteBudget = () => {
    setDeleteDialogVisible(false);
    setBudgetToDelete(null);
  };

  if (isLoading) {
    return (
      <Surface
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Cargando presupuestos...</Text>
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
          Error al cargar presupuestos
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
      {/* Navegador de mes/año */}
      <View style={styles.monthNavigator}>
        <Button
          mode="outlined"
          onPress={() => navigateMonth("prev")}
          style={styles.monthNavButton}
          icon="chevron-left"
          compact
        >
          {" "}
        </Button>
        <Text variant="headlineSmall" style={styles.monthTitle}>
          {formatMonthYear(currentMonthYear)}
        </Text>
        <Button
          mode="outlined"
          onPress={() => navigateMonth("next")}
          style={styles.monthNavButton}
          icon="chevron-right"
          compact
        >
          {" "}
        </Button>
      </View>

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
            {searchQuery
              ? "No se encontraron presupuestos"
              : `No tienes presupuestos para ${formatMonthYear(
                  currentMonthYear
                )}`}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtext, { opacity: 0.7 }]}
          >
            {searchQuery
              ? "Intenta con otros términos de búsqueda"
              : "Crea tu primer presupuesto para este mes usando el botón de abajo"}
          </Text>
        </View>
      )}

      {/* FAB para añadir presupuesto */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Añadir Presupuesto"
      />

      {/* Modal para el formulario */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Nuevo Presupuesto
          </Text>
          <BudgetForm
            onSuccess={handleBudgetAdded}
            onCancel={() => setModalVisible(false)}
            defaultMonthYear={currentMonthYear}
          />
        </Modal>

        {/* Modal para el formulario de edición */}
        <Modal
          visible={editModalVisible}
          onDismiss={cancelEditBudget}
          contentContainerStyle={[
            styles.modal,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Editar Presupuesto
          </Text>
          {budgetToEdit && (
            <EditBudgetForm
              budget={budgetToEdit}
              onSuccess={handleBudgetUpdated}
              onCancel={cancelEditBudget}
            />
          )}
        </Modal>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDeleteBudget}>
          <Dialog.Title>Eliminar Presupuesto</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que quieres eliminar este presupuesto?
            </Text>
            {budgetToDelete && (
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, fontWeight: "bold" }}
              >
                {categoryMap[budgetToDelete.category_id]?.name ||
                  `Categoría ${budgetToDelete.category_id}`}{" "}
                - ${parseFloat(budgetToDelete.amount || "0").toFixed(2)}
              </Text>
            )}
            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDeleteBudget}>Cancelar</Button>
            <Button
              onPress={confirmDeleteBudget}
              loading={deleteBudgetMutation.isPending}
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
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    minWidth: 40,
  },
  monthTitle: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  searchbar: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100, // Espacio para el FAB
  },
  budgetCard: {
    marginBottom: 12,
  },
  budgetHeader: {
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryName: {
    flex: 1,
    fontWeight: "bold",
    marginRight: 8,
  },
  typeChip: {
    minWidth: 70,
  },
  deleteButton: {
    margin: 0,
  },
  limitSection: {
    marginBottom: 12,
  },
  limitText: {
    opacity: 0.7,
    marginBottom: 4,
  },
  limitValue: {
    fontWeight: "bold",
    fontSize: 20,
  },
  monthSection: {
    marginTop: 8,
  },
  monthText: {
    opacity: 0.8,
    fontStyle: "italic",
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
  editButton: {
    margin: 0,
  },
});
