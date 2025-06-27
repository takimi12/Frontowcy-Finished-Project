import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb+srv://tomek12olech:7MytflC2STM5Wroe@cluster.etrcyrp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster";
const dbName = "Books";

let cachedClient = null;

async function connectToDatabase() {
  if (!cachedClient) {
    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables.");
    }
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
    console.log("✅ Połączono z bazą danych MongoDB.");
  }
  return cachedClient.db(dbName);
}

// Funkcja pomocnicza do konwersji dokumentu MongoDB na obiekt z polem 'id'
const convertMongoDoc = (doc) => {
  if (!doc) return null;
  return {
    ...doc,
    id: doc._id.toString()
  };
};

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const borrowingsCollection = db.collection("borrowings");
    
    const { id } = req.query;

    switch (req.method) {
      case "GET": {
        console.log('🔍 Pobieranie wypożyczenia o ID:', id);

        if (!ObjectId.isValid(id)) {
          console.log('❌ Nieprawidłowy ObjectId dla wypożyczenia:', id);
          return res.status(400).json({ error: 'Nieprawidłowy ID wypożyczenia' });
        }

        const borrowing = await borrowingsCollection.findOne({ _id: new ObjectId(id) });

        if (!borrowing) {
          console.log('❌ Wypożyczenie nie znalezione dla ID:', id);
          return res.status(404).json({ error: 'Wypożyczenie nie znalezione' });
        }

        console.log('✅ Wypożyczenie pobrane:', borrowing.bookId || 'bez bookId');
        
        const convertedBorrowing = convertMongoDoc(borrowing);
        return res.status(200).json(convertedBorrowing);
      }

      case "PUT": {
        const updatedBorrowing = { ...req.body };
        
        // Usuwamy id i _id
        delete updatedBorrowing.id;
        delete updatedBorrowing._id;

        console.log('🔍 Aktualizacja wypożyczenia:', {
          borrowingId: id,
          isValidObjectId: ObjectId.isValid(id),
          updatedData: updatedBorrowing
        });

        if (!ObjectId.isValid(id)) {
          console.log('❌ Nieprawidłowy ObjectId dla wypożyczenia:', id);
          return res.status(400).json({ error: 'Nieprawidłowy ID wypożyczenia' });
        }

        const result = await borrowingsCollection.updateOne(
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
        return res.status(200).json({ message: 'Wypożyczenie zaktualizowane' });
      }

      case "DELETE": {
        console.log('🔍 Usuwanie wypożyczenia o ID:', id);

        if (!ObjectId.isValid(id)) {
          console.log('❌ Nieprawidłowy ObjectId dla wypożyczenia:', id);
          return res.status(400).json({ error: 'Nieprawidłowy ID wypożyczenia' });
        }

        const result = await borrowingsCollection.deleteOne({ _id: new ObjectId(id) });

        console.log('📊 Wynik operacji usunięcia wypożyczenia:', {
          deletedCount: result.deletedCount
        });

        if (result.deletedCount === 0) {
          console.log('❌ Wypożyczenie nie znalezione dla ID:', id);
          return res.status(404).json({ error: 'Wypożyczenie nie znalezione' });
        }

        console.log('✅ Wypożyczenie usunięte pomyślnie!');
        return res.status(200).json({ message: 'Wypożyczenie usunięte pomyślnie' });
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("❌ Błąd w handlerze /api/borrowings/[id]:", error);
    console.error('Stack Trace:', error.stack);
    return res.status(500).json({ error: "Wystąpił wewnętrzny błąd serwera." });
  }
}