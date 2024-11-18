const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
var morgan = require("morgan");

var cors = require("cors");

app.use(cors()); // Use this after the variable declaration
app.use(express.json());
app.use(morgan("combined"));
const uri =
  "mongodb+srv://admin:kGvqmSBcFCwlUBft@musicapp.2cdjv.mongodb.net/?retryWrites=true&w=majority&appName=MusicApp";

const client = new MongoClient(uri, {});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Подключено к MongoDB");
    const db = client.db("MusicApp"); // Используем имя базы данных
    const usersCollection = db.collection("UserData"); // Коллекция для хранения пользователей
    return usersCollection;
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Server wait");
});

app.post("/login-signup", async (req, res) => {
  const { login, email, password } = req.body;

  // Проверяем, что все необходимые поля присутствуют
  if (!login || !email || !password) {
    return res.status(400).json({ message: "Все поля обязательны!" });
  }

  try {
    // Подключаемся к коллекции пользователей
    const usersCollection = await connectToDatabase();

    // Создаем новый объект пользователя
    const newUser = {
      login: login,
      email: email,
      password: password, // Обычно пароль следует хешировать перед сохранением
    };

    // Сохраняем данные в базе
    const result = await usersCollection.insertOne(newUser);

    // Ответ на успешную запись
    res.status(201).json({
      message: "Пользователь успешно зарегистрирован!",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Ошибка при записи в базу данных:", error);
    res.status(500).json({ message: "Ошибка сервера при записи данных" });
  }
});

const PORT = 80;
app.listen(PORT, () => {
  console.log(
    `The server is running and waiting for requests on the port ${PORT}`
  );
});
