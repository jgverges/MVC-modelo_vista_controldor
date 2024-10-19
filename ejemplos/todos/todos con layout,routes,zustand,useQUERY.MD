# TODOS CON REACT EN MVC

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
│   │   └── TaskList.tsx
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

Este componente contendrá enlaces para navegar entre las vistas.

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

Un layout que incluye el encabezado y la barra de navegación.

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

### 4. Controlador para Detalles de Tareas (`TaskDetailController.tsx`)

Vamos a crear un controlador que muestre los detalles de una tarea específica.

```typescript
// src/controllers/TaskDetailController.tsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types/Task';

const TaskDetailController: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tasks } = useTasks();
    const task: Task | undefined = tasks.find(t => t.id === Number(id));

    if (!task) {
        return <div>Tarea no encontrada</div>;
    }

    return (
        <div>
            <h2>Detalles de la Tarea</h2>
            <p>ID: {task.id}</p>
            <p>Título: {task.title}</p>
            <p>Completada: {task.completed ? 'Sí' : 'No'}</p>
            <Link to="/">Volver a la lista de tareas</Link>
        </div>
    );
};

export default TaskDetailController;
```

### 5. Modificación del Controlador de Tareas (`TaskController.tsx`)

Vamos a modificar el controlador de tareas para que también tenga acceso a la vista de detalles.

```typescript
// src/controllers/TaskController.tsx

import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskView from '../components/TaskView';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/Task';
import { Link } from 'react-router-dom';

const TaskController: React.FC = () => {
    const { tasks, isLoading, addTask, updateTask, deleteTask } = useTasks();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleEdit = (task: Task) => {
        setEditingTask(task);
    };

    return (
        <div>
            <TaskForm onSubmit={editingTask ? updateTask : addTask} initialTask={editingTask} />
            <TaskView tasks={tasks} isLoading={isLoading} onEdit={handleEdit} onDelete={deleteTask} />
            <Link to="/tasks">Ver todas las tareas</Link>
        </div>
    );
};

export default TaskController;
```

### 6. Modificación de la Aplicación Principal (`App.tsx`)

Integramos el enrutado y el diseño principal.

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

### 7. Actualización de `TaskList.tsx`

Modificamos el componente `TaskList` para incluir un enlace a los detalles de cada tarea.

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

### Resultado

- **Navegación**: Puedes navegar entre las vistas utilizando el encabezado y la barra de navegación.
- **Lista de Tareas**: Puedes agregar, editar y eliminar tareas, y ver detalles de cada tarea.
- **Detalles de Tareas**: Al hacer clic en "Detalles", puedes ver información específica sobre cada tarea.


