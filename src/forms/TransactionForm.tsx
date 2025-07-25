// src/forms/TransactionForm.tsx
import React, { useState } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  useTheme,
  Snackbar,
  Card,
  HelperText,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useCreateCategory, useListCategories } from "@api/categories";
import { useCreateTransaction, useUpdateTransaction } from "@api/transactions";
import {
  CategoryType,
  type CategoryRead,
  type TransactionCreate,
  type TransactionUpdate,
  type TransactionRead,
  type CategoryCreate,
} from "@api/schemas";
import { useAuth } from "@hooks/useAuth";

interface TransactionFormData {
  // Categoría
  categoryName: string;
  categoryType: CategoryType;
  selectedCategoryId: number | null;
  // Transacción
  amount: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "failed";
}

interface TransactionFormProps {
  transaction?: TransactionRead | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TransactionForm({
  transaction,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const isEditing = !!transaction;

  // Estados para UI
  const [createNewCategory, setCreateNewCategory] = useState(!isEditing);
  const [step, setStep] = useState<"category" | "transaction">(
    isEditing ? "transaction" : "category"
  );
  const [error, setError] = useState("");

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    trigger,
  } = useForm<TransactionFormData>({
    defaultValues: {
      categoryName: "",
      categoryType: "expense",
      selectedCategoryId: transaction?.category_id || null,
      amount: transaction?.amount
        ? Math.abs(parseFloat(transaction.amount.toString())).toString()
        : "",
      description: transaction?.description || "",
      date: transaction?.date || new Date().toISOString().split("T")[0],
      status: transaction?.status || "completed",
    },
  });

  const watchedValues = watch();

  // Datos para validaciones
  const { data: existingCategories } = useListCategories({
    query: {
      enabled: !!user && (!createNewCategory || isEditing),
    },
  });

  const createCategoryMutation = useCreateCategory();
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();

  const handleCategoryStep = async () => {
    if (createNewCategory) {
      // Solo validar el nombre de categoría, no crearla todavía
      const isValidName = await trigger("categoryName");
      if (!isValidName) return;

      setStep("transaction");
      setError("");
    } else {
      const isValidSelection = await trigger("selectedCategoryId");
      if (!isValidSelection) return;

      setStep("transaction");
      setError("");
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    try {
      let categoryId = data.selectedCategoryId;

      // Si estamos creando una nueva categoría, crearla primero
      if (createNewCategory && !isEditing) {
        const newCategory = await createCategoryMutation.mutateAsync({
          data: {
            name: data.categoryName.trim(),
            type: data.categoryType,
          },
        });
        categoryId = newCategory.id;
      }

      if (!categoryId) {
        setError("Error: No se pudo determinar la categoría");
        return;
      }

      if (isEditing && transaction) {
        // Actualizar transacción existente
        const updateData: TransactionUpdate = {
          category_id: categoryId,
          amount: parseFloat(data.amount),
          description: data.description.trim() || undefined,
          status: data.status,
        };

        await updateTransactionMutation.mutateAsync({
          transactionId: transaction.id,
          data: updateData,
        });
      } else {
        // Crear nueva transacción
        const createData: TransactionCreate = {
          category_id: categoryId,
          amount: parseFloat(data.amount),
          description: data.description.trim() || undefined,
          date: data.date,
          status: data.status,
        };

        await createTransactionMutation.mutateAsync({
          data: createData,
        });
      }

      // Reset form si no es edición
      if (!isEditing) {
        setValue("categoryName", "");
        setValue("categoryType", "expense");
        setValue("selectedCategoryId", null);
        setValue("amount", "");
        setValue("description", "");
        setValue("date", new Date().toISOString().split("T")[0]);
        setValue("status", "completed");
        setStep("category");
      }

      setError("");
      onSuccess();
    } catch (error: any) {
      console.error("Error saving transaction:", error);
      setError("Error al guardar la transacción. Inténtalo de nuevo.");
    }
  };

  const categoryModeOptions = [
    {
      value: "new",
      label: "Nueva",
      icon: "plus",
    },
    {
      value: "existing",
      label: "Existente",
      icon: "format-list-bulleted",
    },
  ];

  const typeOptions = [
    {
      value: "expense",
      label: "Gasto",
      icon: "arrow-down",
    },
    {
      value: "income",
      label: "Ingreso",
      icon: "arrow-up",
    },
  ];

  const statusOptions = [
    {
      value: "completed",
      label: "Completada",
    },
    {
      value: "pending",
      label: "Pendiente",
    },
    {
      value: "failed",
      label: "Fallida",
    },
  ];

  const isLoading =
    createCategoryMutation.isPending ||
    createTransactionMutation.isPending ||
    updateTransactionMutation.isPending;

  // Si estamos editando, ir directo al paso de transacción
  if (isEditing || step === "transaction") {
    return (
      <ScrollView style={styles.container}>
        <Text variant="headlineSmall" style={styles.stepTitle}>
          {isEditing
            ? "Editar Transacción"
            : "Paso 2: Detalles de la Transacción"}
        </Text>

        {/* Mostrar categoría seleccionada si no es edición */}
        {!isEditing &&
          (createNewCategory
            ? watchedValues.categoryName
            : existingCategories?.find(
                (c) => c.id === watchedValues.selectedCategoryId
              )?.name) && (
            <Card style={styles.selectedCategoryCard}>
              <Card.Content>
                <Text variant="labelLarge">Categoría seleccionada:</Text>
                <Text variant="titleMedium">
                  {createNewCategory
                    ? watchedValues.categoryName
                    : existingCategories?.find(
                        (c) => c.id === watchedValues.selectedCategoryId
                      )?.name}
                </Text>
              </Card.Content>
            </Card>
          )}

        {/* Si estamos editando, mostrar selector de categoría */}
        {isEditing && (
          <View style={styles.categorySection}>
            <Text variant="labelLarge" style={styles.label}>
              Categoría
            </Text>
            <Controller
              control={control}
              name="selectedCategoryId"
              rules={{
                required: "Debes seleccionar una categoría",
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  {existingCategories && existingCategories.length > 0 ? (
                    <View style={styles.categoryList}>
                      {existingCategories.map((category) => (
                        <Card
                          key={category.id}
                          style={[
                            styles.categoryCard,
                            value === category.id &&
                              styles.selectedCategoryCard,
                          ]}
                          onPress={() => onChange(category.id)}
                        >
                          <Card.Content style={styles.categoryCardContent}>
                            <View>
                              <Text variant="titleMedium">{category.name}</Text>
                              <Text variant="bodySmall">
                                {category.type === "income"
                                  ? "Ingreso"
                                  : "Gasto"}
                              </Text>
                            </View>
                          </Card.Content>
                        </Card>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noCategories}>
                      No hay categorías disponibles.
                    </Text>
                  )}
                  <HelperText
                    type="error"
                    visible={!!errors.selectedCategoryId}
                  >
                    {errors.selectedCategoryId?.message}
                  </HelperText>
                </>
              )}
            />
          </View>
        )}

        <Controller
          control={control}
          name="amount"
          rules={{
            required: "El monto es requerido",
            pattern: {
              value: /^\d+(\.\d{1,2})?$/,
              message: "Ingresa un monto válido (ej: 1500.00)",
            },
            validate: (value) => {
              const num = parseFloat(value);
              if (num <= 0) return "El monto debe ser mayor a 0";
              if (num > 1000000) return "El monto debe ser menor a 1,000,000";
              return true;
            },
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                label="Monto"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                left={<TextInput.Icon icon="currency-usd" />}
                error={!!errors.amount}
              />
              <HelperText type="error" visible={!!errors.amount}>
                {errors.amount?.message}
              </HelperText>
            </>
          )}
        />

        <Controller
          control={control}
          name="description"
          rules={{
            maxLength: {
              value: 255,
              message: "La descripción no puede tener más de 255 caracteres",
            },
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                label="Descripción (opcional)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                placeholder="Ej: Compra en el supermercado, Salario mensual"
                multiline
                numberOfLines={2}
                error={!!errors.description}
              />
              <HelperText type="error" visible={!!errors.description}>
                {errors.description?.message}
              </HelperText>
            </>
          )}
        />

        <Controller
          control={control}
          name="date"
          rules={{
            required: "La fecha es requerida",
          }}
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                label="Fecha (YYYY-MM-DD)"
                value={value}
                onChangeText={onChange}
                mode="outlined"
                style={styles.input}
                placeholder="2025-01-15"
                left={<TextInput.Icon icon="calendar" />}
                error={!!errors.date}
              />
              <HelperText type="error" visible={!!errors.date}>
                {errors.date?.message}
              </HelperText>
            </>
          )}
        />

        <Text variant="labelLarge" style={styles.label}>
          Estado de la transacción
        </Text>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <SegmentedButtons
              value={value}
              onValueChange={onChange}
              buttons={statusOptions}
              style={styles.segmentedButtons}
            />
          )}
        />

        <View style={styles.buttonContainer}>
          {!isEditing && (
            <Button
              mode="outlined"
              onPress={() => setStep("category")}
              style={[styles.button, styles.backButton]}
              disabled={isLoading}
            >
              Atrás
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, styles.cancelButton]}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            style={[styles.button, styles.submitButton]}
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? "Actualizar" : "Crear"} Transacción
          </Button>
        </View>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError("")}
          duration={4000}
          style={{ backgroundColor: theme.colors.error }}
        >
          {error}
        </Snackbar>
      </ScrollView>
    );
  }

  // Paso 1: Selección de categoría (solo para nuevas transacciones)
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Paso 1: Seleccionar Categoría
      </Text>

      {/* Selector de modo de categoría */}
      <Text variant="labelLarge" style={styles.label}>
        Modo de categoría
      </Text>
      <SegmentedButtons
        value={createNewCategory ? "new" : "existing"}
        onValueChange={(value) => setCreateNewCategory(value === "new")}
        buttons={categoryModeOptions}
        style={styles.segmentedButtons}
      />

      {createNewCategory ? (
        <View style={styles.newCategorySection}>
          <Controller
            control={control}
            name="categoryName"
            rules={{
              required: "El nombre de la categoría es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
              maxLength: {
                value: 50,
                message: "El nombre no puede tener más de 50 caracteres",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Nombre de la categoría"
                  value={value}
                  onChangeText={onChange}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Ej: Alimentación, Transporte, Salario"
                  error={!!errors.categoryName}
                />
                <HelperText type="error" visible={!!errors.categoryName}>
                  {errors.categoryName?.message}
                </HelperText>
              </>
            )}
          />

          <Text variant="labelLarge" style={styles.label}>
            Tipo de categoría
          </Text>
          <Controller
            control={control}
            name="categoryType"
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={typeOptions}
                style={styles.segmentedButtons}
              />
            )}
          />
        </View>
      ) : (
        <View style={styles.existingCategorySection}>
          <Text variant="labelLarge" style={styles.label}>
            Seleccionar categoría existente
          </Text>

          <Controller
            control={control}
            name="selectedCategoryId"
            rules={{
              required: "Debes seleccionar una categoría",
            }}
            render={({ field: { onChange, value } }) => (
              <>
                {existingCategories && existingCategories.length > 0 ? (
                  <View style={styles.categoryList}>
                    {existingCategories.map((category) => (
                      <Card
                        key={category.id}
                        style={[
                          styles.categoryCard,
                          value === category.id && styles.selectedCategoryCard,
                        ]}
                        onPress={() => onChange(category.id)}
                      >
                        <Card.Content style={styles.categoryCardContent}>
                          <View>
                            <Text variant="titleMedium">{category.name}</Text>
                            <Text variant="bodySmall">
                              {category.type === "income" ? "Ingreso" : "Gasto"}
                            </Text>
                          </View>
                        </Card.Content>
                      </Card>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noCategories}>
                    No tienes categorías creadas. Crea una nueva categoría.
                  </Text>
                )}
                <HelperText type="error" visible={!!errors.selectedCategoryId}>
                  {errors.selectedCategoryId?.message}
                </HelperText>
              </>
            )}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={[styles.button, styles.cancelButton]}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          onPress={handleCategoryStep}
          style={[styles.button, styles.nextButton]}
          disabled={isLoading}
        >
          Siguiente
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={4000}
        style={{ backgroundColor: theme.colors.error }}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  stepTitle: {
    marginBottom: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  newCategorySection: {
    marginTop: 16,
  },
  existingCategorySection: {
    marginTop: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryList: {
    gap: 8,
    marginTop: 8,
  },
  categoryCard: {
    marginBottom: 8,
  },
  categoryCardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noCategories: {
    textAlign: "center",
    opacity: 0.7,
    marginTop: 16,
  },
  selectedCategoryCard: {
    marginBottom: 16,
    backgroundColor: "#e8f5e8",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    // Estilos adicionales si es necesario
  },
  nextButton: {
    // Estilos adicionales si es necesario
  },
  backButton: {
    // Estilos adicionales si es necesario
  },
  submitButton: {
    // Estilos adicionales si es necesario
  },
});
