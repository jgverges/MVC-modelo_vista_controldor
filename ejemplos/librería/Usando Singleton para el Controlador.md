# Versión 2: Usando Singleton para el Controlador compartido

En esta versión, aseguramos que solo exista una instancia del controlador mediante el patrón **singleton**.

#### **1. BookControllerSingleton.ts**
Creamos un singleton para el controlador, asegurando que se use la misma instancia en toda la aplicación.

```typescript
import { BookModel } from './BookModel';
import { BookController } from './BookController';

let instance: BookController | null = null;

export function getBookController() {
  if (!instance) {
    instance = new BookController(new BookModel());
  }
  return instance;
}
```

#### **1. BookModel.ts**
```typescript
export class BookModel {
  books = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 2, title: '1984', author: 'George Orwell' },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
  ];

  getBooks() {
    return this.books;
  }

  getBookById(id: number) {
    return this.books.find(book => book.id === id);
  }
}
```

#### **2. BookController.ts**
```typescript
import { BookModel } from './BookModel';

export class BookController {
  constructor(public model: BookModel) {}

  getBooks() {
    return this.model.getBooks();
  }

  getBookById(id: number) {
    return this.model.getBookById(id);
  }
}
```

#### **2. Main.tsx**
El componente principal, que obtiene el controlador usando el singleton.

```tsx
import React, { useEffect, useState } from 'react';
import { getBookController } from './BookControllerSingleton';
import { Link } from 'react-router-dom';

export default function Main() {
  const controller = getBookController();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const allBooks = controller.getBooks();
    setBooks(allBooks);
  }, []);

  return (
    <div>
      <h1>Library Main Page</h1>
      <ul>
        {books.map(book => (
          <li key={book.id}>
            <Link to={`/detail/${book.id}`}>{book.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### **3. Detail.tsx**
El componente de detalles, que también utiliza el singleton para obtener el controlador.

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookController } from './BookControllerSingleton';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const controller = getBookController();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const selectedBook = controller.getBookById(Number(id));
    setBook(selectedBook || null);
  }, [id]);

  return (
    <div>
      <h1>Book Detail</h1>
      {book ? (
        <div>
          <h2>{book.title}</h2>
          <p>Author: {book.author}</p>
        </div>
      ) : (
        <p>Book not found</p>
      )}
    </div>
  );
}
```

#### **4. App.tsx**
La aplicación principal sigue siendo igual, sin necesidad de un `Provider` ya que el controlador es un singleton.

```tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Main from './Main';
import Detail from './Detail';
import Contact from './Contact';

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>
      </nav>
      <Switch>
        <Route exact path="/" component={Main} />
        <Route path="/detail/:id" component={Detail} />
        <Route path="/contact" component={Contact} />
      </Switch>
    </Router>
  );
}

export default App;
```

#### **7. Contact.tsx**
Una simple página de contacto.

```tsx
import React from 'react';

export default function Contact() {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>If you have any questions, contact us at library@example.com.</p>
    </div>
  );
}
```

## Conclusión:

Ambas versiones garantizan que se use la misma instancia del controlador en toda la aplicación. 

**Context API** permite una mayor flexibilidad para manejar controladores específicos en diferentes áreas de la aplicación, 

**singleton** es más directa y simple, adecuada para aplicaciones pequeñas o medianas.
