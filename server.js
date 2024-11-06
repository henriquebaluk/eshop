const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./path/to/your-firebase-adminsdk.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Middleware de sessão simulada
app.use((req, res, next) => {
  if (!req.cookies.session) {
    res.cookie("session", "novaSessao", { httpOnly: true });
  }
  next();
});

// adicionar um item ao carrinho no Firestore
app.post("/add-to-cart", async (req, res) => {
  const { item } = req.body;
  try {
    const db = admin.firestore();
    await db.collection("cart").add(item);
    res.status(200).json({ message: "Item adicionado ao carrinho!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao adicionar item ao carrinho", error });
  }
});

// Rota para remover um item do carrinho
app.delete("/remove-from-cart/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = admin.firestore();
    await db.collection("cart").doc(id).delete();
    res.status(200).json({ message: "Item removido do carrinho!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover item do carrinho", error });
  }
});

// listar os itens do carrinho
app.get("/cart", async (req, res) => {
  try {
    const db = admin.firestore();
    const cartItems = [];
    const snapshot = await db.collection("cart").get();
    snapshot.forEach((doc) => cartItems.push({ id: doc.id, ...doc.data() }));
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar itens do carrinho", error });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
