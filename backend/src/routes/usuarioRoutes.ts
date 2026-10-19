import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";

const usuarioRoutes = express.Router();

usuarioRoutes.route("api/auth/register").post(async (req, res) => {
	try {
		const { email, password, razonSocial, cuit, condicionIva } = req.body;

		console.log("Leyendo ruta...");
		// 1. Validaciones básicas
		if (!email || !password || !razonSocial || !cuit) {
			return res.status(400).json({
				error: "Todos los campos obligatorios deben ser completados.",
			});
		}

		// 2. Verificar si el usuario o CUIT ya existen
		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [{ email }, { cuit }],
			},
		});

		if (existingUser) {
			return res
				.status(400)
				.json({ error: "El email o CUIT ya se encuentra registrado." });
		}

		// 3. Hashear la contraseña
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(password, saltRounds);

		// 4. Crear el usuario en la base de datos
		const newUser = await prisma.user.create({
			data: {
				email,
				passwordHash,
				razonSocial,
				cuit,
				condicionIva: condicionIva || "MONOTRIBUTO",
			},
			select: {
				id: true,
				email: true,
				razonSocial: true,
				cuit: true,
				condicionIva: true,
				createdAt: true,
			},
		});

		// 5. Devolver la respuesta (o generar httpOnly cookie con JWT/Session)
		return res.status(201).json({
			message: "Usuario registrado exitosamente",
			user: newUser,
		});
	} catch (error) {
		console.error("Error al registrar usuario:", error);
		return res
			.status(500)
			.json({ error: "Error interno del servidor al procesar el registro." });
	}
});

usuarioRoutes.route("/auth/login").post(async (req, res) => {
	try {
		const { email, password } = req.body;

		// 1. Validar que vengan los campos
		if (!email || !password) {
			return res
				.status(400)
				.json({ error: "Email y contraseña son obligatorios." });
		}

		// 2. Buscar al usuario por email
		const user = await prisma.user.findUnique({
			where: { email },
		});

		if (!user) {
			return res.status(401).json({ error: "Credenciales inválidas." });
		}

		// 3. Comparar la contraseña ingresada con el hash de la base de datos
		const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Credenciales inválidas." });
		}

		// 4. Si las credenciales son correctas, devolvemos los datos del usuario (o seteamos un JWT/Cookie)
		const { passwordHash, ...userWithoutPassword } = user;

		return res.status(200).json({
			message: "Login exitoso",
			user: userWithoutPassword,
		});
	} catch (error) {
		console.error("Error al iniciar sesión:", error);
		return res
			.status(500)
			.json({ error: "Error interno del servidor al procesar el login." });
	}
});

export default usuarioRoutes;
