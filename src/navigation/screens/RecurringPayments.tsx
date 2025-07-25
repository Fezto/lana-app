// src/screens/RecurringPayments.tsx
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
  Badge,
} from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListRecurringPayments,
  useDeleteRecurringPayment,
} from "@api/recurring-payments";
import { useListCategories } from "@api/categories";
import { useAuth } from "@hooks/useAuth";
import { RecurringPaymentForm } from "../../forms/RecurringPaymentForm";
import type { RecurringPaymentRead } from "@api/schemas";

export function RecurringPayments() {
  const theme = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [paymentToDelete, setPaymentToDelete] =
    useState<RecurringPaymentRead | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  const {
    data: recurringPayments,
    isLoading,
    error,
    refetch,
  } = useListRecurringPayments(
    { active: filterActive },
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

  const deletePaymentMutation = useDeleteRecurringPayment();

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

  // Formatear frecuencia para mostrar
  const formatFrequency = (frequency: string) => {
    const frequencies: Record<string, string> = {
      daily: "Diario",
      weekly: "Semanal",
      biweekly: "Quincenal",
      monthly: "Mensual",
    };
    return frequencies[frequency] || frequency;
  };

  // Calcular días hasta próximo pago
  const getDaysUntilPayment = (nextDueDate: string) => {
    const today = new Date();
    const dueDate = new Date(nextDueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredPayments =
    recurringPayments?.filter((payment) => {
      const category = categoryMap[payment.category_id];
      const categoryName = category?.name || `Categoría ${payment.category_id}`;
      const description = payment.description || "";

      return (
        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatFrequency(payment.frequency)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    }) || [];

  const renderPayment = ({ item }: { item: RecurringPaymentRead }) => {
    const category = categoryMap[item.category_id];
    const categoryName = category?.name || `Categoría ${item.category_id}`;
    const categoryType = category?.type;
    const daysUntil = getDaysUntilPayment(item.next_due_date);

    return (
      <Card style={styles.paymentCard}>
        <Card.Content>
          <View style={styles.paymentHeader}>
            <View style={styles.categorySection}>
              <View style={styles.categoryInfo}>
                <Text variant="titleMedium" style={styles.categoryName}>
                  {categoryName}
                </Text>
                {item.description && (
                  <Text variant="bodySmall" style={styles.description}>
                    {item.description}
                  </Text>
                )}
              </View>
              <View style={styles.categoryActions}>
                {!item.active && (
                  <Chip
                    mode="outlined"
                    style={[
                      styles.statusChip,
                      { backgroundColor: theme.colors.errorContainer },
                    ]}
                    textStyle={{ color: theme.colors.onErrorContainer }}
                  >
                    Inactivo
                  </Chip>
                )}
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
                  onPress={() => handleDeletePayment(item)}
                  style={styles.deleteButton}
                />
              </View>
            </View>
          </View>

          <View style={styles.amountSection}>
            <Text variant="titleMedium" style={styles.amountLabel}>
              Monto:
            </Text>
            <Text
              variant="titleLarge"
              style={[styles.amountValue, { color: theme.colors.primary }]}
            >
              ${parseFloat(item.amount.toString()).toFixed(2)}
            </Text>
          </View>

          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                📅 Próximo pago:
              </Text>
              <View style={styles.dateInfo}>
                <Text variant="bodyMedium" style={styles.dateText}>
                  {formatDate(item.next_due_date)}
                </Text>
                {daysUntil <= 3 && daysUntil >= 0 && (
                  <Badge
                    style={[
                      styles.urgentBadge,
                      {
                        backgroundColor:
                          daysUntil <= 1
                            ? theme.colors.error
                            : theme.colors.tertiary,
                      },
                    ]}
                  >
                    {daysUntil === 0
                      ? "Hoy"
                      : daysUntil === 1
                      ? "Mañana"
                      : `${daysUntil} días`}
                  </Badge>
                )}
              </View>
            </View>
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>
                🔄 Frecuencia:
              </Text>
              <Text variant="bodyMedium">
                {formatFrequency(item.frequency)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const handlePaymentAdded = () => {
    setModalVisible(false);
    // Invalidar tanto pagos como categorías para refrescar la data
    queryClient.invalidateQueries({ queryKey: ["/recurring-payments/"] });
    queryClient.invalidateQueries({ queryKey: ["/categories/"] });
  };

  const handleDeletePayment = (payment: RecurringPaymentRead) => {
    setPaymentToDelete(payment);
    setDeleteDialogVisible(true);
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      await deletePaymentMutation.mutateAsync({
        recurringPaymentId: paymentToDelete.id,
      });

      // Invalidar queries para refrescar la data
      queryClient.invalidateQueries({ queryKey: ["/recurring-payments/"] });

      setDeleteDialogVisible(false);
      setPaymentToDelete(null);
    } catch (error) {
      console.error("Error deleting recurring payment:", error);
    }
  };

  const cancelDeletePayment = () => {
    setDeleteDialogVisible(false);
    setPaymentToDelete(null);
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
        <Text style={{ marginTop: 16 }}>Cargando pagos programados...</Text>
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
          Error al cargar pagos programados
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
        <View style={styles.filterButtons}>
          <Button
            mode={filterActive === null ? "contained" : "outlined"}
            onPress={() => setFilterActive(null)}
            style={styles.filterButton}
            compact
          >
            Todos
          </Button>
          <Button
            mode={filterActive === true ? "contained" : "outlined"}
            onPress={() => setFilterActive(true)}
            style={styles.filterButton}
            compact
          >
            Activos
          </Button>
          <Button
            mode={filterActive === false ? "contained" : "outlined"}
            onPress={() => setFilterActive(false)}
            style={styles.filterButton}
            compact
          >
            Inactivos
          </Button>
        </View>
      </View>

      {/* Campo de búsqueda */}
      <Searchbar
        placeholder="Buscar pagos programados..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      {/* Lista de pagos programados */}
      {filteredPayments.length > 0 ? (
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPayment}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {searchQuery
              ? "No se encontraron pagos programados"
              : "No tienes pagos programados"}
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtext, { opacity: 0.7 }]}
          >
            {searchQuery
              ? "Intenta con otros términos de búsqueda"
              : "Crea tu primer pago programado usando el botón de abajo"}
          </Text>
        </View>
      )}

      {/* FAB para añadir pago programado */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Añadir Pago"
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
            Nuevo Pago Programado
          </Text>
          <RecurringPaymentForm
            onSuccess={handlePaymentAdded}
            onCancel={() => setModalVisible(false)}
          />
        </Modal>

        {/* Diálogo de confirmación para eliminar */}
        <Dialog visible={deleteDialogVisible} onDismiss={cancelDeletePayment}>
          <Dialog.Title>Eliminar Pago Programado</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              ¿Estás seguro de que quieres eliminar este pago programado?
            </Text>
            {paymentToDelete && (
              <Text
                variant="bodyMedium"
                style={{ marginTop: 8, fontWeight: "bold" }}
              >
                {categoryMap[paymentToDelete.category_id]?.name ||
                  `Categoría ${paymentToDelete.category_id}`}{" "}
                - ${parseFloat(paymentToDelete.amount.toString()).toFixed(2)}
              </Text>
            )}
            <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
              Esta acción no se puede deshacer.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={cancelDeletePayment}>Cancelar</Button>
            <Button
              onPress={confirmDeletePayment}
              loading={deletePaymentMutation.isPending}
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
  filterButtons: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  searchbar: {
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 100, // Espacio para el FAB
  },
  paymentCard: {
    marginBottom: 12,
  },
  paymentHeader: {
    marginBottom: 12,
  },
  categorySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 8,
  },
  categoryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryName: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    opacity: 0.7,
    fontStyle: "italic",
  },
  statusChip: {
    minWidth: 70,
  },
  typeChip: {
    minWidth: 70,
  },
  deleteButton: {
    margin: 0,
  },
  amountSection: {
    marginBottom: 12,
  },
  amountLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  amountValue: {
    fontWeight: "bold",
    fontSize: 20,
  },
  detailsSection: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    opacity: 0.8,
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontWeight: "500",
  },
  urgentBadge: {
    fontSize: 10,
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
