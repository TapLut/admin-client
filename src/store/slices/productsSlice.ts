import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductType, ProductStatus, PaginatedResponse, ProductsQueryReq, CreateProductReq, UpdateProductReq } from '@/types';
import { productsService } from '@/services';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params: { page?: number; limit?: number; search?: string; type?: string; status?: string; sponsorId?: string }, { rejectWithValue }) => {
    try {
      const response = await productsService.getProducts(params);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (data: CreateProductReq, { rejectWithValue }) => {
    try {
      const response = await productsService.createProduct(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
       return rejectWithValue('Failed to create product');
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: UpdateProductReq }, { rejectWithValue }) => {
    try {
      const response = await productsService.updateProduct(id, data);
      return response;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await productsService.deleteProduct(id);
      return id;
    } catch (error) {
       if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to delete product');
    }
  }
);

export const updateProductStatus = createAsyncThunk(
    'products/updateStatus',
    async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
      try {
        const response = await productsService.updateProductStatus(id, status);
        return response;
      } catch (error) {
         if (error instanceof Error) {
          return rejectWithValue(error.message);
        }
        return rejectWithValue('Failed to update product status');
      }
    }
  );

interface ProductsState {
  items: Product[];
  selectedProduct: Product | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    search: string;
    type: ProductType | null;
    status: ProductStatus | null;
    sponsorId: number | null;
  };
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedProduct: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  filters: {
    search: '',
    type: null,
    status: null,
    sponsorId: null,
  },
  isLoading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ProductsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page on filter change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    clearFilters: (state) => {
        state.filters = initialState.filters;
        state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.total += 1;
      })
      // Update Product
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
            state.selectedProduct = action.payload;
        }
      })
      // Update Product Status
      .addCase(updateProductStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const id = parseInt(action.payload);
        state.items = state.items.filter(item => item.id !== id);
        state.total -= 1;
        if (state.selectedProduct?.id === id) {
            state.selectedProduct = null;
        }
      });
  },
});

export const { setFilters, setPage, setSelectedProduct, clearFilters } = productsSlice.actions;
export default productsSlice.reducer;
