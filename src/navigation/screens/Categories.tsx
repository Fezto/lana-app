// src/screens/Categories.tsx
import React, { useState } from "react";
import { StyleSheet, FlatList, View } from "react-native";
import {
  Surface,
  Text,
  Button,
  Card,
  Chip,
  ActivityIndicator,
  useTheme,
  Portal,
  Modal,
  FAB,
} from "react-native-paper";
import { useListCategories } from "@api/categories";
import { useAuth } from "@hooks/useAuth";
// import { CategoryForm } from "../../forms/CategoryForm";
import type { CategoryRead } from "@api/schemas";

export function Categories() {
  const theme = useTheme();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useListCategories({
    query: {
      retry: 2,
      refetchOnWindowFocus: false,
      enabled: !!user, // Solo hacer la consulta si hay usuario
    },
  });

  const renderCategory = ({ item }: { item: CategoryRead }) => (
    <Card style={styles.categoryCard}>
      <Card.Content>
        <View style={styles.categoryHeader}>
          <Text variant="titleMedium" style={styles.categoryTitle}>
            {item.name}
          </Text>
          <Chip
            mode="outlined"
            style={[
              styles.typeChip,
              {
                backgroundColor:
                  item.type === "income"
                    ? theme.colors.primaryContainer
                    : theme.colors.errorContainer,
              },
            ]}
            textStyle={{
              color:
                item.type === "income"
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onErrorContainer,
            }}
          >
            {item.type === "income" ? "Ingreso" : "Gasto"}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );

  const handleCategoryAdded = () => {
    setModalVisible(false);
    refetch(); // Refresca la lista después de agregar
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
        <Text style={{ marginTop: 16 }}>Cargando categorías...</Text>
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
          Error al cargar categorías
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
      {/* Lista de categorías */}
      {categories && categories.length > 0 ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            No tienes categorías aún
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptySubtext, { opacity: 0.7 }]}
          >
            Crea tu primera categoría para organizar tus transacciones
          </Text>
        </View>
      )}

      {/* FAB para añadir categoría */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Añadir Categoría"
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
            Nueva Categoría
          </Text>
          {/* TODO: Implementar CategoryForm
          <CategoryForm
            onSuccess={handleCategoryAdded}
            onCancel={() => setModalVisible(false)}
          />
          */}
          <Button
            mode="contained"
            onPress={() => setModalVisible(false)}
            style={{ marginTop: 16 }}
          >
            Cerrar
          </Button>
        </Modal>
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
  listContainer: {
    paddingBottom: 100, // Espacio para el FAB
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTitle: {
    flex: 1,
    marginRight: 12,
  },
  typeChip: {
    minWidth: 80,
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
    maxHeight: "80%",
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
});
