// src/forms/RecurringPaymentForm.tsx
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
import { useCreateRecurringPayment } from "@api/recurring-payments";
import {
  CategoryType,
  type CategoryRead,
  type RecurringPaymentCreate,
  type CategoryCreate,
  RecurringPaymentCreateFrequency,
} from "@api/schemas";
import { useAuth } from "@hooks/useAuth";

interface RecurringPaymentFormData {
  // Categoría
  categoryName: string;
  categoryType: CategoryType;
  selectedCategoryId: number | null;
  // Pago programado
  amount: string;
  description: string;
  frequency: RecurringPaymentCreateFrequency;
  nextDueDate: string;
  active: boolean;
}

interface RecurringPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function RecurringPaymentForm({
  onSuccess,
  onCancel,
}: RecurringPaymentFormProps) {
  const theme = useTheme();
  const { user } = useAuth();

  // Estados para UI
  const [createNewCategory, setCreateNewCategory] = useState(true);
  const [step, setStep] = useState<"category" | "payment">("category");
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
  } = useForm<RecurringPaymentFormData>({
    defaultValues: {
      categoryName: "",
      categoryType: "expense",
      selectedCategoryId: null,
      amount: "",
      description: "",
      frequency: "monthly",
      nextDueDate: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      active: true,
    },
  });

  const watchedValues = watch();

  // Datos para validaciones
  const { data: existingCategories } = useListCategories({
    query: {
      enabled: !!user && !createNewCategory,
    },
  });

  const createCategoryMutation = useCreateCategory();
  const createPaymentMutation = useCreateRecurringPayment();

  const handleCategoryStep = async () => {
    if (createNewCategory) {
      // Solo validar el nombre de categoría, no crearla todavía
      const isValidName = await trigger("categoryName");
      if (!isValidName) return;

      setStep("payment");
      setError("");
    } else {
      const isValidSelection = await trigger("selectedCategoryId");
      if (!isValidSelection) return;

      setStep("payment");
      setError("");
    }
  };

  const onSubmit = async (data: RecurringPaymentFormData) => {
    try {
      let categoryId = data.selectedCategoryId;

      // Si estamos creando una nueva categoría, crearla primero
      if (createNewCategory) {
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

      // Crear el pago programado
      await createPaymentMutation.mutateAsync({
        data: {
          category_id: categoryId,
          amount: parseFloat(data.amount),
          description: data.description.trim() || undefined,
          frequency: data.frequency,
          next_due_date: data.nextDueDate,
          active: data.active,
        },
      });

      // Reset form
      setValue("categoryName", "");
      setValue("categoryType", "expense");
      setValue("selectedCategoryId", null);
      setValue("amount", "");
      setValue("description", "");
      setValue("frequency", "monthly");
      setValue("nextDueDate", new Date().toISOString().split("T")[0]);
      setValue("active", true);
      setStep("category");
      setError("");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating recurring payment/category:", error);
      setError("Error al crear el pago programado. Inténtalo de nuevo.");
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

  const frequencyOptions = [
    {
      value: "daily",
      label: "Diario",
    },
    {
      value: "weekly",
      label: "Semanal",
    },
    {
      value: "biweekly",
      label: "Quincenal",
    },
    {
      value: "monthly",
      label: "Mensual",
    },
  ];

  const isLoading =
    createCategoryMutation.isPending || createPaymentMutation.isPending;

  if (step === "category") {
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
                    placeholder="Ej: Renta, Internet, Servicios"
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
                      No tienes categorías creadas. Crea una nueva categoría.
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

  // Paso 2: Detalles del pago programado
  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.stepTitle}>
        Paso 2: Detalles del Pago Programado
      </Text>

      {/* Mostrar categoría seleccionada */}
      {(createNewCategory
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
              label="Monto del pago"
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
              placeholder="Ej: Renta del departamento, Servicio de internet"
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

      <Text variant="labelLarge" style={styles.label}>
        Frecuencia de pago
      </Text>
      <Controller
        control={control}
        name="frequency"
        render={({ field: { onChange, value } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={frequencyOptions}
            style={styles.segmentedButtons}
          />
        )}
      />

      <Controller
        control={control}
        name="nextDueDate"
        rules={{
          required: "La fecha del próximo pago es requerida",
          validate: (value) => {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
              return "La fecha debe ser hoy o en el futuro";
            }
            return true;
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Próximo pago (YYYY-MM-DD)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              placeholder="2025-01-15"
              left={<TextInput.Icon icon="calendar" />}
              error={!!errors.nextDueDate}
            />
            <HelperText type="error" visible={!!errors.nextDueDate}>
              {errors.nextDueDate?.message}
            </HelperText>
          </>
        )}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => setStep("category")}
          style={[styles.button, styles.backButton]}
          disabled={isLoading}
        >
          Atrás
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={[styles.button, styles.submitButton]}
          loading={createPaymentMutation.isPending}
          disabled={isLoading}
        >
          Crear Pago Programado
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
