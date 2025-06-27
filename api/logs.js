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
    const logsCollection = db.collection("logs");

    switch (req.method) {
      case "GET": {
        const allLogs = await logsCollection.find({}).sort({ date: -1 }).toArray();
        console.log('📜 Pobrano logi:', allLogs.length);
        
        const convertedLogs = convertMongoDocs(allLogs);
        return res.status(200).json(convertedLogs);
      }

      case "POST": {
        const newLog = { ...req.body };
        delete newLog.id;
        
        // Dodaj timestamp jeśli nie został podany
        if (!newLog.date) {
          newLog.date = new Date().toISOString();
        }
        
        // Dodajemy także createdAt dla spójności
        newLog.createdAt = new Date();
        
        console.log('📜 Nowy log:', newLog);
        
        const result = await logsCollection.insertOne(newLog);
        console.log('✅ Log zapisany z ID:', result.insertedId);
        
        return res.status(201).json({ 
          message: 'Log zapisany', 
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
    console.error("❌ Błąd w handlerze /api/logs:", error);
    return res.status(500).json({ error: "Wystąpił wewnętrzny błąd serwera." });
  }
}