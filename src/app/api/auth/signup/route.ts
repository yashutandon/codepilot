import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmail, createUser } from "@/lib/auth/users";
import { hashPassword } from "@/lib/auth/passwords";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/server";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid signup data";
      return NextResponse.json(
        { error: firstError, issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const existing = await findUserByEmail(email);

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      provider: "credentials",
    });

    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      provider: user.provider,
    };

    const token = await signToken(authUser);
    const response = NextResponse.json({
      success: true,
      user: authUser,
      token,
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}

