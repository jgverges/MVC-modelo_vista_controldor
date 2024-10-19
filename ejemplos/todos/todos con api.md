Claro, vamos a extender el ejemplo anterior de la aplicación de lista de tareas en React para incluir llamadas a una API. Utilizaremos `fetch` para obtener y enviar datos a una API ficticia. 

Para este ejemplo, asumiremos que tienes una API REST que te permite gestionar tareas. Usaremos un endpoint ficticio:

- **GET** `/api/tasks`: Obtiene la lista de tareas.
- **POST** `/api/tasks`: Agrega una nueva tarea.
- **PATCH** `/api/tasks/:id`: Actualiza una tarea (por ejemplo, para marcarla como completada).

### Estructura del Proyecto

```
/react-mvc-api-example
├── /src
│   ├── App.tsx
│   ├── Model.ts
│   ├── View.tsx
│   └── Controller.tsx
├── index.tsx
├── package.json
└── tsconfig.json
```

### 1. Modelo (`Model.ts`)

Actualiza el modelo para incluir llamadas a la API.

```typescript
// src/Model.ts

export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export class TaskModel {
    private apiUrl = 'https://jsonplaceholder.typicode.com/todos'; // Cambia esto a tu API

    public async getTasks(): Promise<Task[]> {
        const response = await fetch(this.apiUrl);
        return response.json();
    }

    public async addTask(title: string): Promise<Task> {
        const newTask: Omit<Task, 'id'> = { title, completed: false };
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });
        return response.json();
    }

    public async toggleTask(id: number): Promise<void> {
        const response = await fetch(`${this.apiUrl}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true }), // Marca como completada
        });
        await response.json();
    }
}
```

### 2. Vista (`View.tsx`)

No hay cambios necesarios en la vista.

```typescript
// src/View.tsx

import React from 'react';
import { Task } from './Model';

interface ViewProps {
    tasks: Task[];
    onToggleTask: (id: number) => void;
}

const TaskView: React.FC<ViewProps> = ({ tasks, onToggleTask }) => {
    return (
        <div>
            <h1>Lista de Tareas</h1>
            <ul>
                {tasks.map(task => (
                    <li key={task.id} onClick={() => onToggleTask(task.id)}>
                        {task.completed ? <s>{task.title}</s> : task.title}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TaskView;
```

### 3. Controlador (`Controller.tsx`)

Actualiza el controlador para manejar llamadas asíncronas a la API.

```typescript
// src/Controller.tsx

import React, { useEffect, useState } from 'react';
import { TaskModel, Task } from './Model';
import TaskView from './View';

const TaskController: React.FC = () => {
    const model = new TaskModel();
    const [tasks, setTasks] = useState<Task[]>([]);
    
    useEffect(() => {
        const fetchTasks = async () => {
            const initialTasks = await model.getTasks();
            setTasks(initialTasks);
        };
        fetchTasks();
    }, [model]);

    const addTask = async (title: string) => {
        const newTask = await model.addTask(title);
        setTasks([...tasks, newTask]);
    };

    const toggleTask = async (id: number) => {
        await model.toggleTask(id);
        const updatedTasks = tasks.map(task => 
            task.id === id ? { ...task, completed: true } : task
        );
        setTasks(updatedTasks);
    };

    const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const title = (event.currentTarget.elements[0] as HTMLInputElement).value;
        if (title) {
            await addTask(title);
            (event.currentTarget.elements[0] as HTMLInputElement).value = '';
        }
    };

    return (
        <div>
            <form onSubmit={handleAddTask}>
                <input type="text" placeholder="Nueva tarea" />
                <button type="submit">Agregar</button>
            </form>
            <TaskView tasks={tasks} onToggleTask={toggleTask} />
        </div>
    );
};

export default TaskController;
```

### 4. Aplicación Principal (`App.tsx`)

No hay cambios necesarios aquí.

```typescript
// src/App.tsx

import React from 'react';
import TaskController from './Controller';

const App: React.FC = () => {
    return (
        <div>
            <TaskController />
        </div>
    );
};

export default App;
```

### 5. Entrada de la Aplicación (`index.tsx`)

Asegúrate de que tu entrada de la aplicación esté configurada correctamente.

```typescript
// src/index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 6. Ejecución

Ahora, puedes ejecutar la aplicación:

```bash
npm start
```

### Resultado

Verás un formulario para agregar nuevas tareas y una lista de tareas que puedes marcar como completadas. La aplicación se conectará a la API para obtener las tareas y para añadir y actualizar tareas.

### Resumen

En este ejemplo:

- **Modelo (`Model.ts`)**: Incluye métodos para interactuar con una API REST para obtener y modificar tareas.
- **Vista (`View.tsx`)**: Presenta la interfaz de usuario.
- **Controlador (`Controller.tsx`)**: Maneja la lógica de la aplicación y la interacción con el modelo y la vista.

Este enfoque muestra cómo puedes integrar un patrón MVC en una aplicación de React que interactúa con una API externa.
