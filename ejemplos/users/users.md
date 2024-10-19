

### Estructura de Carpetas Actualizada

```
/src
  ├── /api
  │     ├── userApi.ts
  ├── /controllers
  │     └── UserController.ts
  ├── /hooks
  │     ├── useUserMutations.ts
  ├── /models
  │     ├── User.ts
  │     └── Product.ts
  ├── /router
  │     └── AppRouter.tsx
  ├── /views
  │     ├── UserView.tsx
  │     ├── ProductView.tsx
  │     ├── /common
  │     │     └── LoadingSpinner.tsx
  │     ├── /users
  │           ├── UserForm.tsx
  │           └── UserList.tsx
  └── App.tsx
  └── index.tsx
```

### Código Actualizado

#### `api/userApi.ts`
```typescript
import axios from 'axios';
import { User } from '../models/User';

const API_URL = 'https://jsonplaceholder.typicode.com/users';

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await axios.post(API_URL, user);
  return response.data;
};

export const updateUser = async (user: User): Promise<User> => {
  const response = await axios.put(`${API_URL}/${user.id}`, user);
  return response.data;
};
```

#### `controllers/UserController.ts`
```typescript
import * as userApi from '../api/userApi';
import { User } from '../models/User';

export class UserController {
  async getAllUsers(): Promise<User[]> {
    return await userApi.fetchUsers();
  }

  async createUser(user: User): Promise<User> {
    return await userApi.createUser(user);
  }

  async updateUser(user: User): Promise<User> {
    return await userApi.updateUser(user);
  }
}
```

#### `hooks/useUserMutations.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserController } from '../controllers/UserController';
import { User } from '../models/User';

const userController = new UserController();

export const useUserMutations = () => {
  const queryClient = useQueryClient();

  const createUserMutation = useMutation(userController.createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  const updateUserMutation = useMutation(userController.updateUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
  });

  return { createUserMutation, updateUserMutation };
};
```

#### `models/User.ts`
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
}
```

#### `views/UserView.tsx`
```tsx
import React, { useEffect, useState } from 'react';
import UserForm from './users/UserForm';
import UserList from './users/UserList';
import { User } from '../models/User';
import { UserController } from '../controllers/UserController';

const userController = new UserController();

const UserView = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userController.getAllUsers();
      setUsers(data);
    };
    
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
  };

  return (
    <div>
      <h1>Gestión de Usuarios</h1>
      <UserList users={users} onEdit={handleEdit} />
      {selectedUser && (
        <div>
          <h2>Editar Usuario</h2>
          <UserForm user={selectedUser} onClose={handleCloseForm} />
        </div>
      )}
    </div>
  );
};

export default UserView;
```

#### `views/users/UserForm.tsx`
```tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../models/User';
import { useUserMutations } from '../../hooks/useUserMutations';

interface UserFormProps {
  user: User;
  onClose: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose }) => {
  const { updateUserMutation } = useUserMutations();
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <button type="submit">Guardar</button>
      <button type="button" onClick={onClose}>Cancelar</button>
    </form>
  );
};

export default UserForm;
```

#### `views/users/UserList.tsx`
```tsx
import React from 'react';
import { User } from '../../models/User';

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit }) => {
  return (
    <div>
      <h2>Lista de Usuarios</h2>
      {users.map((user) => (
        <div key={user.id}>
          {user.name} - {user.email}
          <button onClick={() => onEdit(user)}>Editar</button>
        </div>
      ))}
    </div>
  );
};

export default UserList;
```

#### `views/common/LoadingSpinner.tsx`
```tsx
import React from 'react';

const LoadingSpinner = () => (
  <div>
    <p>Cargando...</p>
  </div>
);

export default LoadingSpinner;
```

#### `router/AppRouter.tsx`
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserView from '../views/UserView';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserView />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
```

#### `App.tsx`
```tsx
import React from 'react';
import AppRouter from './router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppRouter />
  </QueryClientProvider>
);

export default App;
```

#### `index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
```

### Conclusiones

Con estos cambios, hemos asegurado que la estructura del proyecto siga el modelo MVC y que todos los componentes relacionados con las vistas estén organizados de manera clara dentro de la carpeta `views`. 
