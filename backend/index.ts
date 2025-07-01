import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

const uri = process.env.MONGODB_URI || "mongodb+srv://tomek12olech:7MytflC2STM5Wroe@cluster.etrcyrp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const dbName = 'Books';

app.use(cors());
app.use(express.json());

// Funkcja pomocnicza do konwersji dokumentu MongoDB na obiekt z polem 'id'
const convertMongoDoc = (doc: any) => {
  if (!doc) return null;
  return { 
    ...doc,                    
    id: doc._id.toString()     
  };
};

// Funkcja pomocnicza do konwersji tablicy dokumentów MongoDB
const convertMongoDocs = (docs:any) => {
  return docs.map(convertMongoDoc);
};

/** === GET wszystkie książki === **/
app.get('/Books', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection('books');

    const allBooks = await books.find({}).toArray();
    console.log('📚 Pobrano książki:', allBooks.length);
    
    const convertedBooks = convertMongoDocs(allBooks);
    res.json(convertedBooks);
  } catch (error) {
    console.error('❌ Błąd pobierania książek:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === POST dodaj nową książkę === **/
app.post('/Books', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection('books');

    const newBook = req.body;
    delete newBook.id; // Usuwamy id, bo MongoDB automatycznie dodaje _id
    
    console.log('📚 Dodawanie nowej książki:', newBook);
    
    const result = await books.insertOne(newBook);
    console.log('✅ Książka dodana z ID:', result.insertedId);
    
    res.status(201).json({ 
      message: 'Książka dodana', 
      insertedId: result.insertedId,
      id: result.insertedId.toString() // Zwracamy id jako string
    });
  } catch (error) {
    console.error('❌ Błąd dodawania książki:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === PUT aktualizuj książkę po ID === **/
app.put('/Books/:id', async (req, res) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection('books');

    const { id } = req.params;
    const updatedBook = { ...req.body };
    
    // Usuń zarówno `id` (jeśli pochodzi z frontendu), jak i `_id` (jeśli przez pomyłkę zostało wysłane)
    delete updatedBook.id; 
    delete updatedBook._id; 

    console.log('🔍 Rozpoczęcie aktualizacji książki:', {
      bookId: id,
      isValidObjectId: ObjectId.isValid(id),
      updatedData: updatedBook 
    });

    let query;
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id }; // Fallback, choć zalecane jest używanie ObjectId
    }

    const result = await books.updateOne(query, { $set: updatedBook });

    console.log('📊 Wynik operacji aktualizacji książki:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      console.log('❌ Błąd: Książka o podanym ID nie została znaleziona w bazie:', id);
      return res.status(404).json({ error: 'Książka nie znaleziona' });
    }

    console.log('✅ Książka zaktualizowana pomyślnie!');
    res.status(200).json({ message: 'Książka zaktualizowana' });
  } catch (error) {
    console.error('❌ Krytyczny błąd podczas aktualizacji książki:', error);
    console.error('Stack Trace:', (error as Error).stack);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === GET książka po ID === **/
app.get('/Books/:id', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection('books');

    const { id } = req.params;
    
    console.log('🔍 Pobieranie książki o ID:', id);

    let query;
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id };
    }

    const book = await books.findOne(query);

    if (!book) {
      console.log('❌ Książka nie znaleziona dla ID:', id);
      return res.status(404).json({ error: 'Książka nie znaleziona' });
    }

    console.log('✅ Książka pobrana:', book.title || 'bez tytułu');
    
    const convertedBook = convertMongoDoc(book);
    res.json(convertedBook);
    
  } catch (error) {
    console.error('❌ Błąd pobierania książki:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === DELETE usuń książkę po ID === **/
app.delete('/Books/:id', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const books = db.collection('books');

    const { id } = req.params;

    console.log('🔍 Usuwanie książki o ID:', id);

    // Validate if the ID is a valid MongoDB ObjectId
    if (!ObjectId.isValid(id)) {
      console.log('❌ Nieprawidłowy ObjectId dla książki:', id);
      return res.status(400).json({ error: 'Nieprawidłowy ID książki' });
    }

    const result = await books.deleteOne({ _id: new ObjectId(id) });

    console.log('📊 Wynik operacji usunięcia książki:', {
      deletedCount: result.deletedCount
    });

    if (result.deletedCount === 0) {
      console.log('❌ Książka nie znaleziona dla ID:', id);
      return res.status(404).json({ error: 'Książka nie znaleziona' });
    }

    console.log('✅ Książka usunięta pomyślnie!');
    res.status(200).json({ message: 'Książka usunięta pomyślnie' });
  } catch (error) {
    console.error('❌ Błąd podczas usuwania książki:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === GET wszyscy użytkownicy (lub filtruj po cardId i password dla logowania) === **/
app.get('/users', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users'); // Zmieniona nazwa, aby uniknąć konfliktu

    const { cardId, password, email } = req.query;
    let query: any = {};

    if (cardId && password) {
      // Próba logowania: wyszukaj użytkownika po cardId i password
      query = { cardId: cardId, password: password };
      console.log('🔍 Próba logowania z cardId i hasłem:', { cardId, password: '***' });
    } else if (email) {
      // Sprawdzanie istnienia użytkownika po emailu (dla registerUser check)
      query = { email: email };
      console.log('🔍 Sprawdzanie istnienia użytkownika po emailu:', email);
    } else {
      // Ogólne zapytanie o wszystkich użytkowników (np. dla panelu admina)
      console.log('🔍 Pobieranie wszystkich użytkowników');
    }

    const foundUsers = await usersCollection.find(query).toArray();
    console.log(`👥 Znaleziono użytkowników: ${foundUsers.length}`);

    // Konwertujemy _id na id dla każdego znalezionego dokumentu
    const convertedUsers = foundUsers.map(doc => ({
      ...doc,
      id: doc._id.toString()
    }));

    // Jeśli to była próba logowania (z cardId i password), zwróć pojedynczego użytkownika
    if (cardId && password) {
        if (convertedUsers.length > 0) {
            // Zwracamy pierwszego znalezionego użytkownika (zakładając unikalność cardId+password)
            res.json(convertedUsers[0]); 
        } else {
            res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
        }
    } else {
        // W przeciwnym razie zwróć całą tablicę użytkowników
        res.json(convertedUsers); 
    }

  } catch (error) {
    console.error('❌ Błąd pobierania/logowania użytkowników:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === PUT aktualizuj użytkownika po ID === **/
app.put('/users/:id', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const { id } = req.params;
    const updatedUser = { ...req.body };
    delete updatedUser.id; // Usuwamy id, bo nie aktualizujemy go bezpośrednio
    delete updatedUser._id; // Na wypadek, gdyby _id zostało przesłane

    console.log('🔍 Aktualizacja użytkownika:', {
      userId: id,
      isValidObjectId: ObjectId.isValid(id),
      updatedData: updatedUser
    });

    let query;
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id }; // Fallback
    }

    const result = await users.updateOne(query, { $set: updatedUser });

    console.log('📊 Wynik aktualizacji użytkownika:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      console.log('❌ Użytkownik nie znaleziony dla ID:', id);
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    console.log('✅ Użytkownik zaktualizowany pomyślnie');
    res.status(200).json({ message: 'Użytkownik zaktualizowany' });
  } catch (error) {
    console.error('❌ Błąd aktualizacji użytkownika:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});


/** === POST nowy użytkownik === **/
app.post('/users', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const newUser = req.body;
    delete newUser.id; 
    
    console.log('👤 Dodawanie nowego użytkownika:', newUser);
    
    const result = await users.insertOne(newUser);
    console.log('✅ Użytkownik dodany z ID:', result.insertedId);
    
    res.status(201).json({ 
      message: 'Użytkownik dodany', 
      insertedId: result.insertedId,
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('❌ Błąd dodawania użytkownika:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});
app.delete('/users/:id', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const { id } = req.params;

    console.log('🔍 Usuwanie użytkownika o ID:', id);

    if (!ObjectId.isValid(id)) {
      console.log('❌ Nieprawidłowy ObjectId dla użytkownika:', id);
      return res.status(400).json({ error: 'Nieprawidłowy ID użytkownika' });
    }

    const result = await users.deleteOne({ _id: new ObjectId(id) });

    console.log('📊 Wynik operacji usunięcia użytkownika:', {
      deletedCount: result.deletedCount
    });

    if (result.deletedCount === 0) {
      console.log('❌ Użytkownik nie znaleziony dla ID:', id);
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    console.log('✅ Użytkownik usunięty pomyślnie!');
    res.status(200).json({ message: 'Użytkownik usunięty pomyślnie' });
  } catch (error) {
    console.error('❌ Błąd podczas usuwania użytkownika:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === GET wszystkie wypożyczenia === **/
app.get('/borrowings', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const borrowings = db.collection('borrowings');

    const allBorrowings = await borrowings.find({}).toArray();
    console.log('📋 Pobrano wypożyczenia:', allBorrowings.length);
    
    const convertedBorrowings = convertMongoDocs(allBorrowings);
    res.json(convertedBorrowings);
  } catch (error) {
    console.error('❌ Błąd pobierania wypożyczeń:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === POST nowe wypożyczenie === **/
app.post('/borrowings', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const borrowings = db.collection('borrowings');

    const newBorrowing = req.body;
    delete newBorrowing.id; 
    
    console.log('📚 Nowe wypożyczenie:', newBorrowing);

    if (!newBorrowing.userId || !newBorrowing.bookId) {
      console.log('❌ Brak wymaganych pól w wypożyczeniu');
      return res.status(400).json({ error: 'Brak wymaganych pól: userId i bookId' });
    }

    const result = await borrowings.insertOne(newBorrowing);
    
    console.log('✅ Wypożyczenie zapisane:', {
      insertedId: result.insertedId,
      acknowledged: result.acknowledged
    });
    
    res.status(201).json({ 
      message: 'Wypożyczenie zapisane', 
      insertedId: result.insertedId,
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('❌ Błąd zapisu wypożyczenia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === PUT aktualizuj wypożyczenie po ID (np. zwrot książki) === **/
app.put('/borrowings/:id', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const borrowings = db.collection('borrowings');

    const { id } = req.params;
    const updatedBorrowing = { ...req.body };
    delete updatedBorrowing.id; // Usuwamy id, bo nie aktualizujemy go bezpośrednio
    delete updatedBorrowing._id; // Na wypadek, gdyby _id zostało przesłane

    console.log('🔍 Aktualizacja wypożyczenia:', {
      borrowingId: id,
      isValidObjectId: ObjectId.isValid(id), // WAŻNE: sprawdź, czy to zwraca true
      updatedData: updatedBorrowing
    });

    if (!ObjectId.isValid(id)) {
      console.log('❌ Nieprawidłowy ObjectId dla wypożyczenia:', id);
      return res.status(400).json({ error: 'Nieprawidłowy ID wypożyczenia' });
    }

    const result = await borrowings.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedBorrowing }
    );

    console.log('📊 Wynik aktualizacji wypożyczenia:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
    });

    if (result.matchedCount === 0) {
      console.log('❌ Wypożyczenie nie znalezione dla ID:', id);
      return res.status(404).json({ error: 'Wypożyczenie nie znalezione' });
    }

    console.log('✅ Wypożyczenie zaktualizowane pomyślnie');
    res.status(200).json({ message: 'Wypożyczenie zaktualizowane' });
  } catch (error) {
    console.error('❌ Błąd aktualizacji wypożyczenia:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === GET logi === **/
app.get('/logs', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const logs = db.collection('logs');

    const allLogs = await logs.find({}).sort({ date: -1 }).toArray();
    console.log('📜 Pobrano logi:', allLogs.length);
    
    const convertedLogs = convertMongoDocs(allLogs);
    res.json(convertedLogs);
  } catch (error) {
    console.error('❌ Błąd pobierania logów:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === POST nowy log === **/
app.post('/logs', async (req, res) => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const logs = db.collection('logs');

    const newLog = req.body;
    delete newLog.id;
    
    // Dodaj timestamp jeśli nie został podany
    if (!newLog.date) {
      newLog.date = new Date().toISOString();
    }
    
    console.log('📜 Nowy log:', newLog);
    
    const result = await logs.insertOne(newLog);
    console.log('✅ Log zapisany z ID:', result.insertedId);
    
    res.status(201).json({ 
      message: 'Log zapisany', 
      insertedId: result.insertedId,
      id: result.insertedId.toString()
    });
  } catch (error) {
    console.error('❌ Błąd zapisu logu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});

/** === Middleware do obsługi błędów 404 === **/
app.use('*', (req, res) => {
  console.log('❌ 404 - Nie znaleziono endpointu:', req.originalUrl);
  res.status(404).json({ error: 'Endpoint nie znaleziony' });
});

/** === START SERWERA === **/
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
