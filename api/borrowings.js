import { MongoClient } from "mongodb";
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

// Funkcja pomocnicza do konwersji tablicy dokumentów MongoDB
const convertMongoDocs = (docs) => {
  return docs.map(doc => ({
    ...doc,
    id: doc._id.toString()
  }));
};

export default async function handler(req, res) {
  try {
    const db = await connectToDatabase();
    const borrowingsCollection = db.collection("borrowings");

    switch (req.method) {
      case "GET": {
        const allBorrowings = await borrowingsCollection.find({}).toArray();
        console.log('📋 Pobrano wypożyczenia:', allBorrowings.length);
        
        const convertedBorrowings = convertMongoDocs(allBorrowings);
        return res.status(200).json(convertedBorrowings);
      }

      case "POST": {
        const newBorrowing = { ...req.body };
        delete newBorrowing.id;
        
        console.log('📚 Nowe wypożyczenie:', newBorrowing);

        if (!newBorrowing.userId || !newBorrowing.bookId) {
          console.log('❌ Brak wymaganych pól w wypożyczeniu');
          return res.status(400).json({ error: 'Brak wymaganych pól: userId i bookId' });
        }

        // Dodajemy timestamp
        newBorrowing.createdAt = new Date();

        const result = await borrowingsCollection.insertOne(newBorrowing);
        
        console.log('✅ Wypożyczenie zapisane:', {
          insertedId: result.insertedId,
          acknowledged: result.acknowledged
        });
        
        return res.status(201).json({ 
          message: 'Wypożyczenie zapisane', 
          insertedId: result.insertedId,
          id: result.insertedId.toString()
        });
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    }
  } catch (error) {
    console.error("❌ Błąd w handlerze /api/borrowings:", error);
    return res.status(500).json({ error: "Wystąpił wewnętrzny błąd serwera." });
  }
}