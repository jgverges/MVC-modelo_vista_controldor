Claro, aquí tienes un ejemplo básico de una aplicación simple utilizando el patrón MVC en TypeScript. Vamos a crear una pequeña aplicación para gestionar una lista de tareas.

### Estructura del Proyecto

```
/mvc-example
├── /src
│   ├── app.ts
│   ├── model.ts
│   ├── view.ts
│   └── controller.ts
├── tsconfig.json
└── package.json
```

### 1. Configuración Inicial

Asegúrate de tener TypeScript instalado. Si no lo tienes, puedes instalarlo usando npm:

```bash
npm install -g typescript
```

Crea un archivo `tsconfig.json` en la raíz de tu proyecto:

```json
{
  "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

### 2. Modelo (`model.ts`)

Aquí definimos la estructura del modelo de la tarea.

```typescript
// src/model.ts

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

### 3. Vista (`view.ts`)

La vista se encarga de mostrar los datos al usuario.

```typescript
// src/view.ts

import { Task } from './model';

export class TaskView {
    public render(tasks: Task[]): void {
        console.clear();
        console.log("Lista de Tareas:");
        tasks.forEach(task => {
            const status = task.completed ? "[X]" : "[ ]";
            console.log(`${status} ${task.title} (ID: ${task.id})`);
        });
        console.log("\nEscribe 'add <título>' para agregar una tarea o 'toggle <id>' para cambiar su estado.");
    }
}
```

### 4. Controlador (`controller.ts`)

El controlador gestiona la interacción entre el modelo y la vista.

```typescript
// src/controller.ts

import { TaskModel } from './model';
import { TaskView } from './view';

export class TaskController {
    private model: TaskModel;
    private view: TaskView;

    constructor(model: TaskModel, view: TaskView) {
        this.model = model;
        this.view = view;
    }

    public addTask(title: string): void {
        this.model.addTask(title);
        this.updateView();
    }

    public toggleTask(id: number): void {
        this.model.toggleTask(id);
        this.updateView();
    }

    private updateView(): void {
        const tasks = this.model.getTasks();
        this.view.render(tasks);
    }
}
```

### 5. Aplicación Principal (`app.ts`)

En el archivo principal, inicializamos el modelo, la vista y el controlador, y gestionamos la entrada del usuario.

```typescript
// src/app.ts

import { TaskModel } from './model';
import { TaskView } from './view';
import { TaskController } from './controller';

const model = new TaskModel();
const view = new TaskView();
const controller = new TaskController(model, view);

// Función para simular entrada del usuario
const simulateUserInput = (input: string) => {
    const [command, ...args] = input.split(' ');
    if (command === 'add') {
        controller.addTask(args.join(' '));
    } else if (command === 'toggle' && args[0]) {
        const id = parseInt(args[0]);
        controller.toggleTask(id);
    }
};

// Simulando algunas interacciones del usuario
simulateUserInput('add Comprar leche');
simulateUserInput('add Hacer la tarea');
simulateUserInput('toggle 1');
simulateUserInput('toggle 2');
```

### 6. Compilación y Ejecución

Compila el código TypeScript y ejecuta la aplicación:

```bash
tsc
node dist/app.js
```

### Resultado

Verás una lista de tareas en la consola, y podrás agregar nuevas tareas o cambiar su estado mediante los comandos que simula la función `simulateUserInput`.

Este ejemplo es básico, pero ilustra cómo se puede implementar el patrón MVC en TypeScript. Puedes expandirlo añadiendo más funcionalidades, como eliminar tareas o persistir los datos en almacenamiento. ¡Espero que te sirva como un buen punto de partida!
