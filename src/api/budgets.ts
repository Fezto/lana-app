/**
 * Generated by orval v7.9.0 🍺
 * Do not edit manually.
 * FastAPI
 * OpenAPI spec version: 0.1.0
 */
import {
  useMutation,
  useQuery
} from '@tanstack/react-query';
import type {
  DataTag,
  DefinedInitialDataOptions,
  DefinedUseQueryResult,
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UndefinedInitialDataOptions,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query';

import type {
  BudgetCreate,
  BudgetRead,
  BudgetUpdate,
  HTTPValidationError,
  ListBudgetsParams
} from './schemas';

import { customInstance } from './custom-instance';



type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];



/**
 * @summary Create Budget
 */
export const createBudget = (
    budgetCreate: BudgetCreate,
 options?: SecondParameter<typeof customInstance>,signal?: AbortSignal
) => {
      
      
      return customInstance<BudgetRead>(
      {url: `/budgets/`, method: 'POST',
      headers: {'Content-Type': 'application/json', },
      data: budgetCreate, signal
    },
      options);
    }
  


export const getCreateBudgetMutationOptions = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createBudget>>, TError,{data: BudgetCreate}, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof createBudget>>, TError,{data: BudgetCreate}, TContext> => {

const mutationKey = ['createBudget'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof createBudget>>, {data: BudgetCreate}> = (props) => {
          const {data} = props ?? {};

          return  createBudget(data,requestOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type CreateBudgetMutationResult = NonNullable<Awaited<ReturnType<typeof createBudget>>>
    export type CreateBudgetMutationBody = BudgetCreate
    export type CreateBudgetMutationError = HTTPValidationError

    /**
 * @summary Create Budget
 */
export const useCreateBudget = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof createBudget>>, TError,{data: BudgetCreate}, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof createBudget>>,
        TError,
        {data: BudgetCreate},
        TContext
      > => {

      const mutationOptions = getCreateBudgetMutationOptions(options);

      return useMutation(mutationOptions , queryClient);
    }
    /**
 * @summary List Budgets
 */
export const listBudgets = (
    params: ListBudgetsParams,
 options?: SecondParameter<typeof customInstance>,signal?: AbortSignal
) => {
      
      
      return customInstance<BudgetRead[]>(
      {url: `/budgets/`, method: 'GET',
        params, signal
    },
      options);
    }
  

export const getListBudgetsQueryKey = (params: ListBudgetsParams,) => {
    return [`/budgets/`, ...(params ? [params]: [])] as const;
    }

    
export const getListBudgetsQueryOptions = <TData = Awaited<ReturnType<typeof listBudgets>>, TError = HTTPValidationError>(params: ListBudgetsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getListBudgetsQueryKey(params);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof listBudgets>>> = ({ signal }) => listBudgets(params, requestOptions, signal);

      

      

   return  { queryKey, queryFn, ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type ListBudgetsQueryResult = NonNullable<Awaited<ReturnType<typeof listBudgets>>>
export type ListBudgetsQueryError = HTTPValidationError


export function useListBudgets<TData = Awaited<ReturnType<typeof listBudgets>>, TError = HTTPValidationError>(
 params: ListBudgetsParams, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof listBudgets>>,
          TError,
          Awaited<ReturnType<typeof listBudgets>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListBudgets<TData = Awaited<ReturnType<typeof listBudgets>>, TError = HTTPValidationError>(
 params: ListBudgetsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof listBudgets>>,
          TError,
          Awaited<ReturnType<typeof listBudgets>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useListBudgets<TData = Awaited<ReturnType<typeof listBudgets>>, TError = HTTPValidationError>(
 params: ListBudgetsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary List Budgets
 */

export function useListBudgets<TData = Awaited<ReturnType<typeof listBudgets>>, TError = HTTPValidationError>(
 params: ListBudgetsParams, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof listBudgets>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient 
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getListBudgetsQueryOptions(params,options)

  const query = useQuery(queryOptions , queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



/**
 * @summary Get Budget
 */
export const getBudget = (
    budgetId: number,
 options?: SecondParameter<typeof customInstance>,signal?: AbortSignal
) => {
      
      
      return customInstance<BudgetRead>(
      {url: `/budgets/${budgetId}`, method: 'GET', signal
    },
      options);
    }
  

export const getGetBudgetQueryKey = (budgetId: number,) => {
    return [`/budgets/${budgetId}`] as const;
    }

    
export const getGetBudgetQueryOptions = <TData = Awaited<ReturnType<typeof getBudget>>, TError = HTTPValidationError>(budgetId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
) => {

const {query: queryOptions, request: requestOptions} = options ?? {};

  const queryKey =  queryOptions?.queryKey ?? getGetBudgetQueryKey(budgetId);

  

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getBudget>>> = ({ signal }) => getBudget(budgetId, requestOptions, signal);

      

      

   return  { queryKey, queryFn, enabled: !!(budgetId), ...queryOptions} as UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData> & { queryKey: DataTag<QueryKey, TData, TError> }
}

export type GetBudgetQueryResult = NonNullable<Awaited<ReturnType<typeof getBudget>>>
export type GetBudgetQueryError = HTTPValidationError


export function useGetBudget<TData = Awaited<ReturnType<typeof getBudget>>, TError = HTTPValidationError>(
 budgetId: number, options: { query:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData>> & Pick<
        DefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBudget>>,
          TError,
          Awaited<ReturnType<typeof getBudget>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  DefinedUseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBudget<TData = Awaited<ReturnType<typeof getBudget>>, TError = HTTPValidationError>(
 budgetId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData>> & Pick<
        UndefinedInitialDataOptions<
          Awaited<ReturnType<typeof getBudget>>,
          TError,
          Awaited<ReturnType<typeof getBudget>>
        > , 'initialData'
      >, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
export function useGetBudget<TData = Awaited<ReturnType<typeof getBudget>>, TError = HTTPValidationError>(
 budgetId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient
  ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> }
/**
 * @summary Get Budget
 */

export function useGetBudget<TData = Awaited<ReturnType<typeof getBudget>>, TError = HTTPValidationError>(
 budgetId: number, options?: { query?:Partial<UseQueryOptions<Awaited<ReturnType<typeof getBudget>>, TError, TData>>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient 
 ):  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> } {

  const queryOptions = getGetBudgetQueryOptions(budgetId,options)

  const query = useQuery(queryOptions , queryClient) as  UseQueryResult<TData, TError> & { queryKey: DataTag<QueryKey, TData, TError> };

  query.queryKey = queryOptions.queryKey ;

  return query;
}



/**
 * @summary Update Budget
 */
export const updateBudget = (
    budgetId: number,
    budgetUpdate: BudgetUpdate,
 options?: SecondParameter<typeof customInstance>,) => {
      
      
      return customInstance<BudgetRead>(
      {url: `/budgets/${budgetId}`, method: 'PUT',
      headers: {'Content-Type': 'application/json', },
      data: budgetUpdate
    },
      options);
    }
  


export const getUpdateBudgetMutationOptions = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateBudget>>, TError,{budgetId: number;data: BudgetUpdate}, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof updateBudget>>, TError,{budgetId: number;data: BudgetUpdate}, TContext> => {

const mutationKey = ['updateBudget'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof updateBudget>>, {budgetId: number;data: BudgetUpdate}> = (props) => {
          const {budgetId,data} = props ?? {};

          return  updateBudget(budgetId,data,requestOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type UpdateBudgetMutationResult = NonNullable<Awaited<ReturnType<typeof updateBudget>>>
    export type UpdateBudgetMutationBody = BudgetUpdate
    export type UpdateBudgetMutationError = HTTPValidationError

    /**
 * @summary Update Budget
 */
export const useUpdateBudget = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof updateBudget>>, TError,{budgetId: number;data: BudgetUpdate}, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof updateBudget>>,
        TError,
        {budgetId: number;data: BudgetUpdate},
        TContext
      > => {

      const mutationOptions = getUpdateBudgetMutationOptions(options);

      return useMutation(mutationOptions , queryClient);
    }
    /**
 * @summary Delete Budget
 */
export const deleteBudget = (
    budgetId: number,
 options?: SecondParameter<typeof customInstance>,) => {
      
      
      return customInstance<void>(
      {url: `/budgets/${budgetId}`, method: 'DELETE'
    },
      options);
    }
  


export const getDeleteBudgetMutationOptions = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteBudget>>, TError,{budgetId: number}, TContext>, request?: SecondParameter<typeof customInstance>}
): UseMutationOptions<Awaited<ReturnType<typeof deleteBudget>>, TError,{budgetId: number}, TContext> => {

const mutationKey = ['deleteBudget'];
const {mutation: mutationOptions, request: requestOptions} = options ?
      options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : {...options, mutation: {...options.mutation, mutationKey}}
      : {mutation: { mutationKey, }, request: undefined};

      


      const mutationFn: MutationFunction<Awaited<ReturnType<typeof deleteBudget>>, {budgetId: number}> = (props) => {
          const {budgetId} = props ?? {};

          return  deleteBudget(budgetId,requestOptions)
        }

        


  return  { mutationFn, ...mutationOptions }}

    export type DeleteBudgetMutationResult = NonNullable<Awaited<ReturnType<typeof deleteBudget>>>
    
    export type DeleteBudgetMutationError = HTTPValidationError

    /**
 * @summary Delete Budget
 */
export const useDeleteBudget = <TError = HTTPValidationError,
    TContext = unknown>(options?: { mutation?:UseMutationOptions<Awaited<ReturnType<typeof deleteBudget>>, TError,{budgetId: number}, TContext>, request?: SecondParameter<typeof customInstance>}
 , queryClient?: QueryClient): UseMutationResult<
        Awaited<ReturnType<typeof deleteBudget>>,
        TError,
        {budgetId: number},
        TContext
      > => {

      const mutationOptions = getDeleteBudgetMutationOptions(options);

      return useMutation(mutationOptions , queryClient);
    }
    