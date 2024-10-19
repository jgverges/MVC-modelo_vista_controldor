# MVC : User application

### **Estructura de la Aplicación**

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

### **1. Modelos de Datos (Models)**

Los modelos contienen la estructura de datos que maneja la aplicación.

#### `models/User.ts`
```ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}
```

#### `models/Product.ts`
```ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}
```

### **2. Controladores (Controllers)**

Los controladores contienen la lógica de negocio de la aplicación.

#### `controllers/UserController.ts`
```ts
import { User } from '../models/User';
import { fetchUsers, createUser, updateUser } from '../api/userApi';

export class UserController {
  async getAllUsers(): Promise<User[]> {
    return await fetchUsers();
  }

  async createUser(user: User): Promise<User> {
    return await createUser(user);
  }

  async updateUser(user: User): Promise<User> {
    return await updateUser(user.id, user);
  }
}
```

### **3. API (Llamadas a API)**

Las funciones que realizan las peticiones HTTP a la API.

#### `api/userApi.ts`
```ts
import { User } from '../models/User';

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

### **4. Hooks Personalizados (TanStack Query)**

Usamos **TanStack Query** para gestionar los datos de los usuarios.

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
import { User } from '../models/User';

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

### **5. Estado Global (Zustand)**

Definimos un estado global que puede ser accedido desde cualquier componente para mostrar el estado de carga y otras configuraciones globales.

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

### **6. Loading Global**

Un componente para mostrar el spinner de carga en cualquier parte de la aplicación, conectado a **Zustand**.

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

### **7. Formularios de Usuario (Crear/Editar)**

El formulario reutilizable para crear o editar un usuario, usando **react-hook-form**.

#### `components/users/UserForm.tsx`
```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateUserMutation, useUpdateUserMutation } from '../../hooks/useUserMutations';
import { User } from '../../models/User';

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

### **8. Listado de Usuarios**

Un componente que lista los usuarios y permite editar cada uno.

#### `components/users/UserList.tsx`
```tsx
import React, { useState } from 'react';
import { useUsers } from '../../hooks/useUsers';
import UserForm from './UserForm';
import { User } from '../../models/User';

const UserList = () => {
  const { data: users, isLoading } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

### **9. Layouts y Navegación**

Gestionamos las rutas con **React Router** y distintos layouts.

#### `components/layouts/MainLayout.tsx`
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <header>Main Layout Header</header>
      <main><Outlet /></main>
      <footer>Main Layout Footer</footer>
    </div>
  );
};

export default MainLayout;
```

#### `router/Router.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes

 } from 'react-router-dom';
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

### **10. Componente Principal (App)**

#### `App.tsx`
```tsx
import React from 'react';
import AppRouter from './router/Router';
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

### **Conclusión**


Esta aplicación está estructurada con **MVC**, utilizando **Zustand** para el estado global (loading),

**TanStack Query** para el manejo de datos, y distintas capas como los modelos, controladores, vistas y componentes reutilizables.
