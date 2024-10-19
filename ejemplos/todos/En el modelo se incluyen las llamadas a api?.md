# En el modelo se incluyen las llamadas a api?

Sí, en el ejemplo proporcionado, el modelo incluye las llamadas a la API. Esto es parte del enfoque de separación de responsabilidades en el patrón MVC. Aquí te explico más sobre cómo funciona esto y por qué es así:

### ¿Por qué incluir las llamadas a la API en el modelo?

1. **Responsabilidad del Modelo:**
   - El modelo se encarga de la lógica de negocio y la gestión de datos. Esto incluye no solo la manipulación de los datos en memoria, sino también la interacción con fuentes externas, como bases de datos o APIs.
   - Al manejar las llamadas a la API en el modelo, se mantiene una separación clara entre la lógica de negocio (cómo se gestionan las tareas) y la presentación (cómo se muestran las tareas en la interfaz de usuario).

2. **Facilidad de Mantenimiento:**
   - Si las llamadas a la API están encapsuladas en el modelo, es más fácil realizar cambios en la lógica de acceso a datos sin afectar a los componentes de la vista o del controlador.
   - Por ejemplo, si decides cambiar la API o modificar la forma en que se manejan las respuestas, solo necesitarías ajustar el modelo.

3. **Reutilización:**
   - Al tener un modelo que maneja la lógica de acceso a la API, puedes reutilizarlo en diferentes partes de la aplicación o incluso en otras aplicaciones si es necesario.

### Ejemplo de Modelo con Llamadas a la API

Aquí tienes un resumen del modelo con llamadas a la API, tal como se definió en el ejemplo:

```typescript
// src/Model.ts

export interface Task {
    id: number;
    title: string;
    completed: boolean;
}

export class TaskModel {
    private apiUrl = 'https://jsonplaceholder.typicode.com/todos'; // API ficticia

    // Obtener tareas desde la API
    public async getTasks(): Promise<Task[]> {
        const response = await fetch(this.apiUrl);
        return response.json();
    }

    // Agregar una nueva tarea a la API
    public async addTask(title: string): Promise<Task> {
        const newTask: Omit<Task, 'id'> = { title, completed: false };
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });
        return response.json();
    }

    // Cambiar el estado de una tarea a completada
    public async toggleTask(id: number): Promise<void> {
        await fetch(`${this.apiUrl}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true }), // Marca como completada
        });
    }
}
```

### Resumen

Al incluir las llamadas a la API en el modelo, estamos asegurando que la aplicación mantenga una arquitectura limpia y organizada.
Esto permite que el controlador se enfoque en la lógica de flujo y la vista en la presentación, mientras 
que el modelo se ocupa de los datos y su gestión. 
