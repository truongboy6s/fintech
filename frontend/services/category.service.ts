import apiClient from './api';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  parentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  icon?: string;
  color?: string;
  type: CategoryType;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  icon?: string;
  color?: string;
  type?: CategoryType;
  parentId?: string;
}

class CategoryService {
  private basePath = '/categories';

  async getAll(type?: CategoryType): Promise<Category[]> {
    const params = type ? { type } : {};
    return apiClient.get<Category[]>(this.basePath, { params });
  }

  async getById(id: string): Promise<Category> {
    return apiClient.get<Category>(`${this.basePath}/${id}`);
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    return apiClient.post<Category>(this.basePath, data);
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    return apiClient.patch<Category>(`${this.basePath}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const categoryService = new CategoryService();
export default categoryService;
