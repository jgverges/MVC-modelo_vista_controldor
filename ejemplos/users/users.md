

### Estructura de Carpetas

```
/src
  ├── /api
  │     ├── userApi.ts
  ├── /components
  │     ├── /common
  │     │     └── LoadingSpinner.tsx
  │     ├── /layouts
  │     │     └── MainLayout.tsx
  │     └── /users
  │           ├── UserForm.tsx
  │           └── UserList.tsx
  ├── /controllers
  │     └── UserController.ts
  ├── /hooks
  │     ├── useUserMutations.ts
  ├── /models
  │     ├── User.ts
  │     └── Product.ts
  ├── /router
  │     └── AppRouter.tsx
  └── App.tsx
  └── index.tsx
```

### 1. Definición de Interfaces en `models`

#### `models/User.ts`
```ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export type UserFormData = Omit<User, 'id'>; // Tipo para los datos del formulario, excluyendo el ID
```

#### `models/Product.ts`
```ts
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

export type ProductFormData = Omit<Product, 'id'>; // Tipo para los datos del formulario de productos
```

### 2. API para Usuarios

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

### 3. Controlador de Usuarios

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

### 4. Hooks para Mutaciones de Usuarios

#### `hooks/useUserMutations.ts`
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '../models/User';
import { UserController } from '../controllers/UserController';

const userController = new UserController();

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newUser: User) => userController.createUser(newUser),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => userController.updateUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
```

### 5. Componente de Carga

#### `components/common/LoadingSpinner.tsx`
```tsx
import React from 'react';

const LoadingSpinner = () => {
  return <div>Cargando...</div>; // Componente de carga simple
};

export default LoadingSpinner;
```

### 6. Componente de Formulario de Usuario

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

### 7. Componente de Lista de Usuarios

#### `components/users/UserList.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import { UserController } from '../../controllers/UserController';
import UserForm from './UserForm';
import { User } from '../../models/User';

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
      {users.map((user) => (
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

### 8. Layout Principal

#### `components/layouts/MainLayout.tsx`
```tsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div>
      <header>Main Layout Header</header>
      <main>
        <Outlet />
      </main>
      <footer>Main Layout Footer</footer>
    </div>
  );
};

export default MainLayout;
```

### 9. Rutas de la Aplicación

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

### 10. Componente Principal (App)

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

### 11. Entrada de la Aplic

ación

#### `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### Conclusiones

Esta versión de la aplicación ahora está organizada de manera que las interfaces están en la capa de modelos, eliminando la duplicación y mejorando la estructura general del código. Además, se mantienen las interacciones complejas que has solicitado, como las llamadas a APIs, el uso de Zustand y TanStack Query, y el sistema de carga global.

