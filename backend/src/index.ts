import "dotenv/config";
import cors from "cors";
import express from "express";
import { prisma } from "./db";
import ComprobantesRouter from "./routes/comprobantesRoutes";
import padronRoutes from "./routes/padronRoutes";

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.use(ComprobantesRouter);
app.use(padronRoutes);
app.use(express.json({ limit: "10mb" }));

app.listen(PORT, async () => {
	try {
		console.log("Conectando a la base de datos...");

		await prisma.$connect();
		console.log(`Servidor conectado y escuchando en el PUERTO ${PORT}`);
	} catch (err) {
		console.log("Error al conectar el servidor.");
	}
});
