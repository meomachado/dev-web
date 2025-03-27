import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const db = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DBAS,
});

const app = express();
app.use(express.json());

//Retorna todos os contatos
app.get("/", async (req, res) => {
    try {
        const sql = "SELECT * FROM contatos";
        const contatos = await db.query(sql);
        res.status(200).send(contatos.rows);
    } catch (e) {
        console.log(e);
        res.status(500).send({ erro: "Um erro ocorreu" });
    }
});

//Retorna um contato baseado no id
app.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const sql = "SELECT * FROM contatos WHERE id = " + id;
        const contatos = await db.query(sql);
        res.status(200).send(contatos.rows);
    } catch (e) {
        console.log(e);
        res.status(500).send({ erro: "Um erro ocorreu" });
    }
});

app.post("/", async (req, res) => {
    const { nome, telefone, email, nota, ativo } = req.body;
    const values = [nome, telefone, email, nota, ativo];

    try {
        const sql =
            "INSERT INTO contatos(nome, telefone, email, nota, ativo) VALUES ($1, $2, $3, $4, $5)";
        const r = await db.query(sql, values);
        res.status(201).send(r);
    } catch (e) {
        console.log(e);
        res.status(500).send({ erro: "Um erro ocorreu" });
    }
});

app.put("/:id", async (req, res) => {
    const id = req.params.id;
    const contato_alterar = req.body;

    let sqlTemp = ["UPDATE contatos"];
    sqlTemp.push("SET");
    let temp = [];

    const col = Object.keys(contato_alterar);
    col.forEach((c, i) => {
        temp.push(c + " = $" + (i + 1));
    });

    sqlTemp.push(temp.join(", "));
    sqlTemp.push("WHERE id = " + id + " RETURNING *");
    const sql = sqlTemp.join(" ");

    //Obtem os valores dos atributos
    var atributos = col.map((c) => {
        return contato_alterar[c];
    })

    try {
        const r = await db.query(sql, atributos);
        res.status(200).send(r.rows);
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ erro: "Um erro ocorreu" });
    }
});

app.listen(process.env.APP_PORT, () => {
    console.log("Server running at http://localhost:3000/");
});