import { ApiOperationWrapper } from "./operation-wrapper";

// ============================================================================
// REQUEST OPTIONS TYPE
// ============================================================================

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  [key: string]: unknown;
}

// ============================================================================
// API CLIENT INTERFACE
// ============================================================================

export interface ApiClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T>;
  put<T, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T>;
  patch<T, D = unknown>(
    url: string,
    data?: D,
    options?: RequestOptions
  ): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
}

// ============================================================================
// GENERIC RESOURCE API CLIENT
// ============================================================================

export class ResourceApiClient<
  T,
  CreateT = Omit<T, "id" | "created_at" | "updated_at">,
  UpdateT = Partial<CreateT>
> {
  constructor(
    protected apiClient: ApiClient,
    protected resourceName: string,
    protected basePath: string
  ) {}

  /**
   * List resources with optional filtering
   */
  async list(
    params?: URLSearchParams | Record<string, string>
  ): Promise<{ items: T[]; count: number }> {
    return ApiOperationWrapper.execute(
      async () => {
        let queryString = "";

        if (params) {
          if (params instanceof URLSearchParams) {
            queryString = params.toString();
          } else {
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value) urlParams.append(key, value);
            });
            queryString = urlParams.toString();
          }
        }

        const url = `${this.basePath}/${queryString ? `?${queryString}` : ""}`;
        return this.apiClient.get<{ items: T[]; count: number }>(url);
      },
      {
        operationName: `list${this.resourceName}`,
        resource: this.resourceName,
      }
    );
  }

  /**
   * Get a single resource by ID
   */
  async get(id: string): Promise<T> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.get<T>(`${this.basePath}/${id}`),
      {
        operationName: `get${this.resourceName}`,
        resource: this.resourceName,
        identifier: id,
      }
    );
  }

  /**
   * Create a new resource
   */
  async create(data: CreateT): Promise<T> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.post<T>(`${this.basePath}`, data),
      {
        operationName: `create${this.resourceName}`,
        resource: this.resourceName,
      }
    );
  }

  /**
   * Update a resource (PUT)
   */
  async update(id: string, data: UpdateT): Promise<T> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.put<T>(`${this.basePath}/${id}`, data),
      {
        operationName: `update${this.resourceName}`,
        resource: this.resourceName,
        identifier: id,
      }
    );
  }

  /**
   * Partially update a resource (PATCH)
   */
  async patch(id: string, data: Partial<UpdateT>): Promise<T> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.patch<T>(`${this.basePath}/${id}`, data),
      {
        operationName: `patch${this.resourceName}`,
        resource: this.resourceName,
        identifier: id,
      }
    );
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    return ApiOperationWrapper.execute(
      async () => this.apiClient.delete(`${this.basePath}/${id}`),
      {
        operationName: `delete${this.resourceName}`,
        resource: this.resourceName,
        identifier: id,
      }
    );
  }
}

// ============================================================================
// RESOURCE CLIENT FACTORY
// ============================================================================

export class ApiClientFactory {
  constructor(private apiClient: ApiClient) {}

  createResourceClient<
    T,
    CreateT = Omit<T, "id" | "created_at" | "updated_at">,
    UpdateT = Partial<CreateT>
  >(
    resourceName: string,
    basePath: string
  ): ResourceApiClient<T, CreateT, UpdateT> {
    return new ResourceApiClient<T, CreateT, UpdateT>(
      this.apiClient,
      resourceName,
      basePath
    );
  }
}
