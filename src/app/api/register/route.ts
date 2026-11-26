// src/app/api/register/route.ts
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { MosesCafeEmailService } from "@/lib/email-service";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`register:${clientIp(request)}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Trop de tentatives. Réessayez plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, password } = body;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    // Vérifie si tous les champs sont présents
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Nom, email et mot de passe sont requis." },
        { status: 400 }
      );
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { message: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email existe déjà." },
        { status: 400 }
      );
    }

    // 🔐 Hashage du mot de passe (12 rounds pour plus de sécurité)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Création du nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Défaut USER
        emailVerified: new Date(), // Auto-vérifié pour simplifier
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // 📧 Envoyer l'email de bienvenue
    MosesCafeEmailService.sendWelcomeEmail(name, email)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Email de bienvenue envoyé à ${email}`);
        } else {
          console.error(`❌ Échec envoi email de bienvenue à ${email}:`, result.reason);
        }
      })
      .catch((error) => {
        console.error(`Exception envoi email de bienvenue:`, error);
      });

    return NextResponse.json({ 
      message: "Compte créé avec succès ! Un email de bienvenue vous a été envoyé.",
      user: newUser 
    }, { status: 201 });

  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { message: "Erreur serveur. Veuillez réessayer." },
      { status: 500 }
    );
  }
}