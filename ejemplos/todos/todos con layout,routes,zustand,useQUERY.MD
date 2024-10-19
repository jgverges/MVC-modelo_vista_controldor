# TODOS MVC

### Estructura del Proyecto

```
/react-mvc-complex-example
├── /src
│   ├── App.tsx
│   ├── /components
│   │   ├── Header.tsx
│   │   ├── Navbar.tsx
│   │   ├── TaskView.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── TaskDetailView.tsx
│   ├── /models
│   │   └── TaskModel.ts
│   ├── /controllers
│   │   ├── TaskController.tsx
│   │   └── TaskDetailController.tsx
│   ├── /stores
│   │   └── useTaskStore.ts
│   ├── /types
│   │   └── Task.ts
│   ├── /hooks
│   │   └── useTasks.ts
│   ├── /layouts
│   │   └── MainLayout.tsx
│   └── index.tsx
├── package.json
└── tsconfig.json
```

### 1. Componente de Encabezado (`Header.tsx`)

```typescript
// src/components/Header.tsx

import React from 'react';

const Header: React.FC = () => {
    return (
        <header style={{ padding: '10px', background: '#282c34', color: 'white' }}>
            <h1>Gestión de Tareas</h1>
        </header>
    );
};

export default Header;
```

### 2. Componente de Navegación (`Navbar.tsx`)

```typescript
// src/components/Navbar.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav style={{ padding: '10px' }}>
            <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
            <Link to="/tasks">Ver Tareas</Link>
        </nav>
    );
};

export default Navbar;
```

### 3. Componente de Diseño Principal (`MainLayout.tsx`)

```typescript
// src/layouts/MainLayout.tsx

import React from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div>
            <Header />
            <Navbar />
            <main style={{ padding: '20px' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
```

### 4. Modelo (`TaskModel.ts`)

```typescript
// src/models/TaskModel.ts

import { Task } from '../types/Task';

const apiUrl = 'https://jsonplaceholder.typicode.com/todos';

export const fetchTasks = async (): Promise<Task[]> => {
    const response = await fetch(apiUrl);
    return response.json();
};

export const addTask = async (title: string): Promise<Task> => {
    const newTask: Omit<Task, 'id'> = { title, completed: false };
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
    });
    return response.json();
};

export const updateTask = async (task: Task): Promise<Task> => {
    const response = await fetch(`${apiUrl}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
    });
    return response.json();
};

export const deleteTask = async (id: number): Promise<void> => {
    await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
    });
};
```

### 5. Estado Global con Zustand (`useTaskStore.ts`)

```typescript
// src/stores/useTaskStore.ts

import create from 'zustand';
import { Task } from '../types/Task';

interface TaskStore {
    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
}

export const useTaskStore = create<TaskStore>(set => ({
    tasks: [],
    setTasks: (tasks) => set({ tasks }),
}));
```

### 6. Hooks para manejar datos (`useTasks.ts`)

```typescript
// src/hooks/useTasks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, addTask, updateTask, deleteTask } from '../models/TaskModel';
import { useTaskStore } from '../stores/useTaskStore';

export const useTasks = () => {
    const queryClient = useQueryClient();
    const { setTasks } = useTaskStore();

    const { data: tasks = [], isLoading } = useQuery(['tasks'], fetchTasks, {
        onSuccess: setTasks,
    });

    const addTaskMutation = useMutation(addTask, {
        onSuccess: () => queryClient.invalidateQueries(['tasks']),
    });

    const updateTaskMutation = useMutation(updateTask, {
        onSuccess: () => queryClient.invalidateQueries(['tasks']),
    });

    const deleteTaskMutation = useMutation(deleteTask, {
        onSuccess: () => queryClient.invalidateQueries(['tasks']),
    });

    return {
        tasks,
        isLoading,
        addTask: addTaskMutation.mutate,
        updateTask: updateTaskMutation.mutate,
        deleteTask: deleteTaskMutation.mutate,
    };
};
```

### 7. Componente de Formulario (`TaskForm.tsx`)

```typescript
// src/components/TaskForm.tsx

import React, { useState } from 'react';
import { Task } from '../types/Task';

interface TaskFormProps {
    onSubmit: (task: Task) => void;
    initialTask?: Task;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialTask }) => {
    const [title, setTitle] = useState(initialTask ? initialTask.title : '');

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (title.trim()) {
            onSubmit({ ...initialTask, title, id: initialTask ? initialTask.id : Date.now(), completed: false } as Task);
            setTitle('');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Nueva tarea"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <button type="submit">{initialTask ? 'Actualizar' : 'Agregar'}</button>
        </form>
    );
};

export default TaskForm;
```

### 8. Componente de Vista de Tareas (`TaskView.tsx`)

```typescript
// src/components/TaskView.tsx

import React from 'react';
import { Task } from '../types/Task';
import TaskList from './TaskList';

interface TaskViewProps {
    tasks: Task[];
    isLoading: boolean;
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}

const TaskView: React.FC<TaskViewProps> = ({ tasks, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <div>
            <h1>Lista de Tareas</h1>
            <TaskList tasks={tasks} onEdit={onEdit} onDelete={onDelete} />
        </div>
    );
};

export default TaskView;
```

### 9. Componente de Lista de Tareas (`TaskList.tsx`)

```typescript
// src/components/TaskList.tsx

import React from 'react';
import { Task } from '../types/Task';
import { Link } from 'react-router-dom';

interface TaskListProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete }) => {
    return (
        <ul>
            {tasks.map(task => (
                <li key={task.id}>
                    <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                        {task.title}
                    </span>
                    <Link to={`/tasks/${task.id}`} style={{ margin: '0 10px' }}>Detalles</Link>
                    <button onClick={() => onEdit(task)}>Editar</button>
                    <button onClick={() => onDelete(task.id)}>Eliminar</button>
                </li>
            ))}
        </ul>
    );
};

export default TaskList;
```

### 10. Componente de Vista de Detalles de Tarea (`TaskDetailView.tsx`)

```typescript
// src/components/TaskDetailView.tsx

import React from 'react';
import { Task } from '../types/Task';

interface TaskDetailViewProps {
    task: Task;
}

const TaskDetailView: React.FC<TaskDetailViewProps> = ({ task }) => {
    return (
        <div>
            <h2>Detalles de la Tarea</h2>
            <p>ID: {

task.id}</p>
            <p>Título: {task.title}</p>
            <p>Completada: {task.completed ? 'Sí' : 'No'}</p>
        </div>
    );
};

export default TaskDetailView;
```

### 11. Controlador de Tareas (`TaskController.tsx`)

```typescript
// src/controllers/TaskController.tsx

import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskView from '../components/TaskView';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/Task';

const TaskController: React.FC = () => {
    const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleEdit = (task: Task) => {
        setEditingTask(task);
    };

    const handleSubmit = (task: Task) => {
        if (editingTask) {
            updateTask(task);
        } else {
            addTask(task.title);
        }
        setEditingTask(null);
    };

    return (
        <div>
            <TaskForm onSubmit={handleSubmit} initialTask={editingTask} />
            <TaskView tasks={tasks} isLoading={isLoading} onEdit={handleEdit} onDelete={deleteTask} />
        </div>
    );
};

export default TaskController;
```

### 12. Controlador de Detalles de Tareas (`TaskDetailController.tsx`)

```typescript
// src/controllers/TaskDetailController.tsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import TaskDetailView from '../components/TaskDetailView';

const TaskDetailController: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tasks } = useTasks();
    const task = tasks.find(t => t.id === Number(id));

    if (!task) {
        return <div>Tarea no encontrada</div>; // Manejo de error
    }

    return (
        <div>
            <TaskDetailView task={task} />
            <Link to="/">Volver a la lista de tareas</Link>
        </div>
    );
};

export default TaskDetailController;
```

### 13. Aplicación Principal (`App.tsx`)

```typescript
// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TaskController from './controllers/TaskController';
import TaskDetailController from './controllers/TaskDetailController';
import MainLayout from './layouts/MainLayout';

const App: React.FC = () => {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<TaskController />} />
                    <Route path="/tasks" element={<TaskController />} />
                    <Route path="/tasks/:id" element={<TaskDetailController />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default App;
```


### Resumen

- **Controladores**: `TaskController` y `TaskDetailController` gestionan la lógica y los datos.
- **Vistas**: `TaskView`, `TaskList`, y `TaskDetailView` se centran solo en la presentación.
  
Esta estructura clara permite que la aplicación sea más fácil de mantener y escalar. 
