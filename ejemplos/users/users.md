
### **Estructura Actualizada de la Aplicación**

```
/src
  /components
    /common        // Componentes reutilizables (LoadingSpinner, etc.)
    /layouts       // Distintos layouts de la aplicación
    /users         // Componentes relacionados con usuarios (UserForm, UserList, etc.)
    /products      // Componentes relacionados con productos
  /controllers     // Lógica de controladores para manejar peticiones y lógica del negocio
  /models          // Definición de modelos
  /types           // Definiciones de tipos e interfaces
  /store           // Archivos relacionados con Zustand
  /api             // Llamadas a APIs (fetch)
  /hooks           // Hooks personalizados (TanStack Query)
  /views           // Páginas completas que renderizan la UI
  /router          // Configuración de rutas
  App.tsx          // Componente principal
  index.tsx        // Entrada de la aplicación
```

### **1. Interfaces en la Carpeta `types`**

#### `types/UserTypes.ts`
```ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type UserFormData = Omit<User, 'id'>; // Tipo para los datos del formulario, excluyendo el ID
```

#### `types/ProductTypes.ts`
```ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export type ProductFormData = Omit<Product, 'id'>; // Tipo para los datos del formulario de productos
```

### **2. Modelos (Models)**

#### `models/UserModel.ts`
```ts
import { User } from '../types/UserTypes';

export class UserModel {
  constructor(private user: User) {}

  getUser() {
    return this.user;
  }
}
```

### **3. Controladores (Controllers)**

#### `controllers/UserController.ts`
```ts
import { User } from '../types/UserTypes';
import { fetchUsers, createUser, updateUser } from '../api/userApi';
import { useUsers } from '../hooks/useUsers';

export class UserController {
  async getAllUsers(): Promise<User[]> {
    const users = await fetchUsers();
    return users;
  }

  async createUser(user: User): Promise<User> {
    return await createUser(user);
  }

  async updateUser(user: User): Promise<User> {
    return await updateUser(user.id, user);
  }

  getUserHook() {
    return useUsers(); // Usar el hook en el controlador
  }
}
```

### **4. API (Llamadas a API)**

#### `api/userApi.ts`
```ts
import { User } from '../types/UserTypes';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch('https://api.example.com/users');
  if (!response.ok) throw new Error('Error fetching users');
  return response.json();
};

export const createUser = async (newUser: User): Promise<User> => {
  const response = await fetch('https://api.example.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  });
  if (!response.ok) throw new Error('Error creating user');
  return response.json();
};

export const updateUser = async (userId: number, updatedUser: User): Promise<User> => {
  const response = await fetch(`https://api.example.com/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedUser),
  });
  if (!response.ok) throw new Error('Error updating user');
  return response.json();
};
```

### **5. Hooks Personalizados (TanStack Query)**

#### `hooks/useUsers.ts`
```ts
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/userApi';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
```

#### `hooks/useUserMutations.ts`
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser } from '../api/userApi';
import { User } from '../types/UserTypes';

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => updateUser(user.id, user),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
```

### **6. Estado Global (Zustand)**

#### `store/useGlobalStore.ts`
```ts
import { create } from 'zustand';

interface GlobalState {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
  isLoading: false,
  setLoading: (loading: boolean) => set(() => ({ isLoading: loading })),
}));
```

### **7. Loading Global**

#### `components/common/LoadingSpinner.tsx`
```tsx
import React from 'react';
import { useGlobalStore } from '../../store/useGlobalStore';

const LoadingSpinner = () => {
  const { isLoading } = useGlobalStore();

  if (!isLoading) return null;

  return <div className="spinner">Loading...</div>;
};

export default LoadingSpinner;
```

### **8. Formularios de Usuario (Crear/Editar)**

#### `components/users/UserForm.tsx`
```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUserMutation, useUpdateUserMutation } from '../../hooks/useUserMutations';
import { User } from '../../types/UserTypes';

interface UserFormProps {
  user?: User;
  onClose: () => void;
}

const UserForm = ({ user, onClose }: UserFormProps) => {
  const { register, handleSubmit, reset } = useForm<User>({
    defaultValues: user || { name: '', email: '', role: '' },
  });

  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const onSubmit = (data: User) => {
    if (user) {
      updateUserMutation.mutate(data, { onSuccess: () => { reset(); onClose(); } });
    } else {
      createUserMutation.mutate(data, { onSuccess: () => { reset(); onClose(); } });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>Nombre</label>
        <input {...register('name')} />
      </div>
      <div>
        <label>Email</label>
        <input {...register('email')} />
      </div>
      <div>
        <label>Rol</label>
        <input {...register('role')} />
      </div>
      <button type="submit">{user ? 'Actualizar' : 'Crear'}</button>
    </form>
  );
};

export default UserForm;
```

### **9. Listado de Usuarios**

#### `components/users/UserList.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { UserController } from '../../controllers/UserController';
import UserForm from './UserForm';
import { User } from '../../types/UserTypes';

const userController = new UserController();

const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await userController.getAllUsers();
      setUsers(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
  };

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      {isLoading && <p>Cargando...</p>}
      {users?.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
          <button onClick={() => handleEdit(user)}>Editar</button>
        </div>
      ))}
      {selectedUser && (
        <div>
          <h2>Editar Usuario</h2>
          <UserForm user={selectedUser} onClose={handleCloseForm} />
        </div>
      )}
    </div>
  );
};

export default UserList;
```

### **10. Layouts y Navegación**

#### `components/layouts/MainLayout.tsx`
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <header>Main Layout Header</header>
      <main><Outlet /></main

>
      <footer>Main Layout Footer</footer>
    </div>
  );
};

export default MainLayout;
```

### **11. Rutas de la Aplicación**

#### `router/AppRouter.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import UserList from '../components/users/UserList';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route path="users" element={<UserList />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
```

### **12. Componente Principal (App)**

#### `App.tsx`
```tsx
import React from 'react';
import AppRouter from './router/AppRouter';
import LoadingSpinner from './components/common/LoadingSpinner';

const App = () => {
  return (
    <div>
      <LoadingSpinner />
      <AppRouter />
    </div>
  );
};

export default App;
```

### **13. Entrada de la Aplicación**

#### `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### **Conclusión**

Esta versión de la aplicación sigue los principios de la arquitectura **MVC**, evita la duplicación de interfaces y asegura que las vistas no accedan directamente a los hooks, utilizando controladores como intermediarios. Esto mantiene una clara separación de responsabilidades y facilita el mantenimiento y la escalabilidad de la aplicación.
