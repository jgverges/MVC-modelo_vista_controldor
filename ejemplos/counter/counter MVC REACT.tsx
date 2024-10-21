// Counter en  MVC con REACT

// Modelo
class CounterModel {
  private value: number = 0

  getValue(): number {
    return this.value
  }

  increment(): void {
    this.value++
  }

  decrement(): void {
    this.value--
  }
}

// Controlador
class CounterController {
  constructor(
      private model: CounterModel, 
      private setViewValue: (value: number) => void
    ) {}

  increment(): void {
    this.model.increment()
    this.updateView()
  }

  decrement(): void {
    this.model.decrement()
    this.updateView()
  }

  private updateView(): void {
    this.setViewValue(this.model.getValue())
  }
}

// Vista (Componente React)
import { useState, useEffect } from 'react'

export default function MVCCounter() {
  const [value, setValue] = useState(0);
  const controllerRef = useRef<CounterController | null>(null); 

  useEffect(() => {
    if (!controllerRef.current) {   // Para evitar reinstanciar el controlador si cambia de componente
      const model = new CounterModel();
      const newController = new CounterController(model, setValue);
      controllerRef.current = newController;
    }
  }, []); // Solo se ejecuta en el montaje inicial

  return (
    <>
      <h1>Arquitectura MVC Model-View-Controller</h1>
      
      <h2>{value}</h2>
      
      <Button onClick={() => controllerRef.current?.decrement()}>-</Button>
      <Button onClick={() => controllerRef.current?.increment()}>+</Button>
    </>
  );
}

// Si necesitas conservar el estado al cambiar de componente y volver, debes usar una solución de 
// estado global, como Zustand o Redux, o
// almacenar el estado en un componente de nivel superior que no se desmonte.
