# InventoryManagement


1. He combinado todos los componentes (Modelo, Vista y Controlador) en un solo archivo para simplificar la demostración.
2. He implementado un API simulado usando `Promise.resolve()` para imitar las llamadas a la API sin depender de un backend real.
3. El Modelo (`useInventoryModel`) ahora maneja correctamente el estado de los productos, la carga y los errores.
4. La Vista (`InventoryView`) recibe todas las props necesarias y las utiliza correctamente.
5. El Controlador (`InventoryController`) usa `useEffect` para cargar los productos iniciales y pasa las funciones necesarias a la Vista.

Muestra una lista de productos inicial, permite añadir nuevos productos y actualizar el stock de los productos existentes.

La estructura sigue el patrón MVC:

- Modelo: `useInventoryModel` maneja la lógica de negocio y el estado.
- Vista: `InventoryView` se encarga de la presentación.
- Controlador: `InventoryController` coordina entre el Modelo y la Vista.



