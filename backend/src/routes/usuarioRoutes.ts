import express from "express";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../db";

const usuarioRoutes = express.Router();

usuarioRoutes.route("/api/auth/register").post(async (req, res) => {
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

usuarioRoutes.route("/api/auth/login").post(async (req, res) => {
  try {
    const { cuit, password } = req.body;

    if (!cuit || !password) {
      return res
        .status(400)
        .json({ error: "CUIT y contraseña son obligatorios." });
    }

    // Buscar al usuario por cuit
    const user = await prisma.user.findUnique({
      where: { cuit },
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

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
