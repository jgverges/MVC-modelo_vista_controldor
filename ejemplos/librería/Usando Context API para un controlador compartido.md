### **Versión 1: Usando Context API para un controlador compartido**

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

#### **3. BookControllerContext.tsx**
Este archivo crea un contexto que comparte la misma instancia del controlador.

```tsx
import React, { createContext, useContext } from 'react';
import { BookController } from './BookController';
import { BookModel } from './BookModel';

const BookControllerContext = createContext<BookController | null>(null);

export const useBookController = () => {
  return useContext(BookControllerContext);
};

export function BookControllerProvider({ children }) {
  const controller = new BookController(new BookModel());

  return (
    <BookControllerContext.Provider value={controller}>
      {children}
    </BookControllerContext.Provider>
  );
}
```

#### **4. Main.tsx**
Este es el componente que utiliza el controlador a través del contexto.

```tsx
import React, { useEffect, useState } from 'react';
import { useBookController } from './BookControllerContext';
import { Link } from 'react-router-dom';

export default function Main() {
  const controller = useBookController();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const allBooks = controller?.getBooks();
    setBooks(allBooks || []);
  }, [controller]);

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

#### **5. Detail.tsx**
El componente de detalles del libro.

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBookController } from './BookControllerContext';

export default function Detail() {
  const { id } = useParams<{ id: string }>();
  const controller = useBookController();
  const [book, setBook] = useState(null);

  useEffect(() => {
    const selectedBook = controller?.getBookById(Number(id));
    setBook(selectedBook || null);
  }, [controller, id]);

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

#### **6. App.tsx**
La aplicación principal con el `BookControllerProvider` que envuelve toda la aplicación para compartir el controlador.

```tsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Main from './Main';
import Detail from './Detail';
import Contact from './Contact';
import { BookControllerProvider } from './BookControllerContext';

function App() {
  return (
    <BookControllerProvider>
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
    </BookControllerProvider>
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

```

## Conclusión:

Ambas versiones garantizan que se use la misma instancia del controlador en toda la aplicación. 

**Context API** permite una mayor flexibilidad para manejar controladores específicos en diferentes áreas de la aplicación, 

**singleton** es más directa y simple, adecuada para aplicaciones pequeñas o medianas.
