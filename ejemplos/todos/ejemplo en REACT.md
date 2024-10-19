# MVC (To-Do List) con React. 


### Estructura del Proyecto

```
/react-mvc-example
├── /src
│   ├── App.tsx
│   ├── Model.ts
│   ├── View.tsx
│   └── Controller.tsx
├── index.tsx
├── package.json
└── tsconfig.json
```

### 1. Configuración Inicial

Asegúrate de tener un proyecto de React configurado.

### 2. Modelo (`Model.ts`)

Define el modelo de la tarea.

```typescript
// src/Model.ts

export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export class TaskModel {
    private tasks: Task[] = [];
    private nextId: number = 1;

    public getTasks(): Task[] {
        return this.tasks;
    }

    public addTask(title: string): void {
        const newTask: Task = { id: this.nextId++, title, completed: false };
        this.tasks.push(newTask);
    }

    public toggleTask(id: number): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
        }
    }
}
```

### 3. Vista (`View.tsx`)

Crea un componente para mostrar la lista de tareas.

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

### 4. Controlador (`Controller.tsx`)

El controlador maneja la lógica de la aplicación y conecta el modelo y la vista.

```typescript
// src/Controller.tsx

import React, { useState } from 'react';
import { TaskModel } from './Model';
import TaskView from './View';

const TaskController: React.FC = () => {
    const [model] = useState(new TaskModel());
    const [tasks, setTasks] = useState(model.getTasks());

    const addTask = (title: string) => {
        model.addTask(title);
        setTasks(model.getTasks());
    };

    const toggleTask = (id: number) => {
        model.toggleTask(id);
        setTasks(model.getTasks());
    };

    const handleAddTask = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const title = (event.currentTarget.elements[0] as HTMLInputElement).value;
        if (title) {
            addTask(title);
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

### 5. Aplicación Principal (`App.tsx`)

En el archivo principal, renderiza el controlador.

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

### 6. Entrada de la Aplicación (`index.tsx`)

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

### 7. Ejecución

Ahora, puedes ejecutar la aplicación:

```bash
npm start
```

### Resultado

Verás un formulario para agregar nuevas tareas y una lista de tareas que puedes marcar como completadas al hacer clic sobre ellas.

### Resumen

En este ejemplo:

- **Modelo (`Model.ts`)**: Define la estructura de los datos y la lógica de negocio.
- **Vista (`View.tsx`)**: Representa la interfaz de usuario y presenta los datos.
- **Controlador (`Controller.tsx`)**: Maneja la lógica de la aplicación, interactúa con el modelo y actualiza la vista.

Este enfoque muestra cómo se puede aplicar el patrón MVC en una aplicación de React, manteniendo la separación de preocupaciones. ¡Espero que te resulte útil!
