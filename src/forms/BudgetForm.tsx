// src/forms/BudgetForm.tsx
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
import { useCreateBudget, useListBudgets } from "@api/budgets";
import {
  CategoryType,
  type CategoryRead,
  type BudgetCreate,
  type CategoryCreate,
} from "@api/schemas";
import { useAuth } from "@hooks/useAuth";

interface BudgetFormData {
  // Categoría
  categoryName: string;
  categoryType: CategoryType;
  selectedCategoryId: number | null;
  // Presupuesto
  amount: string;
  monthYear: string;
}

interface BudgetFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  defaultMonthYear?: string;
}

export function BudgetForm({
  onSuccess,
  onCancel,
  defaultMonthYear,
}: BudgetFormProps) {
  const theme = useTheme();
  const { user } = useAuth();

  // Estados para UI
  const [createNewCategory, setCreateNewCategory] = useState(true);
  const [step, setStep] = useState<"category" | "budget">("category");
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
  } = useForm<BudgetFormData>({
    defaultValues: {
      categoryName: "",
      categoryType: "expense",
      selectedCategoryId: null,
      amount: "",
      monthYear: defaultMonthYear || new Date().toISOString().slice(0, 7),
    },
  });

  const watchedValues = watch();

  // Datos para validaciones
  const { data: existingCategories } = useListCategories({
    query: {
      enabled: !!user && !createNewCategory,
    },
  });

  const { data: existingBudgets } = useListBudgets(undefined, {
    query: {
      enabled: !!user,
    },
  });

  const createCategoryMutation = useCreateCategory();
  const createBudgetMutation = useCreateBudget();

  // Validaciones personalizadas
  const validateBudgetNotExists = (categoryId: number, monthYear: string) => {
    if (!existingBudgets) return true;

    const budgetExists = existingBudgets.some(
      (budget) =>
        budget.category_id === categoryId && budget.month_year === monthYear
    );

    return (
      !budgetExists ||
      "Ya existe un presupuesto para esta categoría en este mes"
    );
  };

  const handleCategoryStep = async () => {
    if (createNewCategory) {
      // Solo validar el nombre de categoría, no crearla todavía
      const isValidName = await trigger("categoryName");
      if (!isValidName) return;

      setStep("budget");
      setError("");
    } else {
      const isValidSelection = await trigger("selectedCategoryId");
      if (!isValidSelection) return;

      setStep("budget");
      setError("");
    }
  };

  const onSubmit = async (data: BudgetFormData) => {
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

      // Validar que no exista el presupuesto
      const validationResult = validateBudgetNotExists(
        categoryId,
        data.monthYear
      );
      if (validationResult !== true) {
        setError(validationResult);
        return;
      }

      // Crear el presupuesto
      await createBudgetMutation.mutateAsync({
        data: {
          category_id: categoryId,
          amount: parseFloat(data.amount),
          month_year: data.monthYear,
        },
      });

      // Reset form
      setValue("categoryName", "");
      setValue("categoryType", "expense");
      setValue("selectedCategoryId", null);
      setValue("amount", "");
      setValue("monthYear", new Date().toISOString().slice(0, 7));
      setStep("category");
      setError("");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating budget/category:", error);
      setError("Error al crear el presupuesto. Inténtalo de nuevo.");
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

  const isLoading =
    createCategoryMutation.isPending || createBudgetMutation.isPending;

  if (step === "category") {
    return (
      <ScrollView style={styles.container}>
        <Text variant="titleMedium" style={styles.stepTitle}>
          Paso 1: Categoría
        </Text>

        <Text variant="labelLarge" style={styles.label}>
          ¿Quieres crear una nueva categoría o usar una existente?
        </Text>
        <SegmentedButtons
          value={createNewCategory ? "new" : "existing"}
          onValueChange={(value) => {
            setCreateNewCategory(value === "new");
            setValue("selectedCategoryId", null);
          }}
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
                minLength: { value: 2, message: "Mínimo 2 caracteres" },
                maxLength: { value: 50, message: "Máximo 50 caracteres" },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    label="Nombre de la categoría"
                    value={value}
                    onChangeText={onChange}
                    mode="outlined"
                    style={styles.input}
                    placeholder="Ej: Comida, Transporte, Entretenimiento..."
                    autoCapitalize="words"
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
                  onValueChange={(newValue) =>
                    onChange(newValue as CategoryType)
                  }
                  buttons={typeOptions}
                  style={styles.segmentedButtons}
                />
              )}
            />
          </View>
        ) : (
          <View style={styles.existingCategorySection}>
            <Text variant="labelLarge" style={styles.label}>
              Selecciona una categoría existente
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
                      {existingCategories.map((category: CategoryRead) => (
                        <Card
                          key={category.id}
                          style={[
                            styles.categoryCard,
                            value === category.id && {
                              backgroundColor: theme.colors.primaryContainer,
                            },
                          ]}
                          onPress={() => onChange(category.id)}
                        >
                          <Card.Content style={styles.categoryCardContent}>
                            <Text variant="titleMedium">{category.name}</Text>
                            <Text
                              variant="bodySmall"
                              style={{
                                color:
                                  category.type === "income"
                                    ? "green"
                                    : theme.colors.error,
                              }}
                            >
                              {category.type === "income" ? "Ingreso" : "Gasto"}
                            </Text>
                          </Card.Content>
                        </Card>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noCategories}>
                      No tienes categorías. Crea una nueva categoría.
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
            loading={createCategoryMutation.isPending}
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

  // Paso 2: Presupuesto
  return (
    <ScrollView style={styles.container}>
      <Text variant="titleMedium" style={styles.stepTitle}>
        Paso 2: Presupuesto
      </Text>

      <Card style={styles.selectedCategoryCard}>
        <Card.Content>
          <Text variant="labelMedium">Categoría seleccionada:</Text>
          <Text variant="titleMedium">
            {watchedValues.categoryName ||
              existingCategories?.find(
                (cat) => cat.id === watchedValues.selectedCategoryId
              )?.name ||
              "Categoría seleccionada"}
          </Text>
        </Card.Content>
      </Card>

      <Controller
        control={control}
        name="amount"
        rules={{
          required: "El monto es requerido",
          pattern: {
            value: /^\d+(\.\d{1,2})?$/,
            message: "Formato inválido. Use formato: 123.45",
          },
          min: { value: 0.01, message: "El monto debe ser mayor a 0" },
          max: { value: 999999.99, message: "El monto es demasiado alto" },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Monto del presupuesto"
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
        name="monthYear"
        rules={{
          required: "El mes y año son requeridos",
          pattern: {
            value: /^\d{4}-\d{2}$/,
            message: "Formato debe ser YYYY-MM (ej: 2025-01)",
          },
          validate: (value) => {
            const [year, month] = value.split("-").map(Number);
            const currentYear = new Date().getFullYear();

            if (year < currentYear || year > currentYear + 5) {
              return "Año debe estar entre este año y 5 años en el futuro";
            }
            if (month < 1 || month > 12) {
              return "Mes debe estar entre 01 y 12";
            }
            return true;
          },
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextInput
              label="Mes y año (YYYY-MM)"
              value={value}
              onChangeText={onChange}
              mode="outlined"
              style={styles.input}
              placeholder="2025-01"
              left={<TextInput.Icon icon="calendar" />}
              error={!!errors.monthYear}
            />
            <HelperText type="error" visible={!!errors.monthYear}>
              {errors.monthYear?.message}
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
          loading={createBudgetMutation.isPending}
          disabled={isLoading}
        >
          Crear Presupuesto
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
