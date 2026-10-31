import { convex } from "@/lib/convex-client";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  picture?: string;
  passwordHash?: string;
  provider: "google" | "credentials";
  googleId?: string;
  githubToken?: string;
  createdAt: number;
  updatedAt: number;
}

// In-memory fallback store for offline development or resilient operation
const memoryUsers = new Map<string, UserRecord>();

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Try Convex first
  try {
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      const doc = await convex.query(api.users.getByEmail, {
        email: normalizedEmail,
      });
      if (doc) {
        return {
          id: doc._id,
          email: doc.email,
          name: doc.name,
          picture: doc.picture,
          passwordHash: doc.passwordHash,
          provider: (doc.provider as UserRecord["provider"]) || "credentials",
          googleId: doc.googleId,
          githubToken: doc.githubToken,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn("Convex findUserByEmail failed, checking local store:", err);
  }

  // Fallback to memory store
  for (const user of memoryUsers.values()) {
    if (user.email.toLowerCase() === normalizedEmail) {
      return user;
    }
  }

  return null;
}

export async function findUserByGoogleId(googleId: string): Promise<UserRecord | null> {
  try {
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      const doc = await convex.query(api.users.getByGoogleId, { googleId });
      if (doc) {
        return {
          id: doc._id,
          email: doc.email,
          name: doc.name,
          picture: doc.picture,
          passwordHash: doc.passwordHash,
          provider: "google",
          googleId: doc.googleId,
          githubToken: doc.githubToken,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn("Convex findUserByGoogleId failed, checking local store:", err);
  }

  for (const user of memoryUsers.values()) {
    if (user.googleId === googleId) {
      return user;
    }
  }

  return null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  try {
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      const doc = await convex.query(api.users.getById, { id: id as Id<"users"> });
      if (doc) {
        return {
          id: doc._id,
          email: doc.email,
          name: doc.name,
          picture: doc.picture,
          passwordHash: doc.passwordHash,
          provider: (doc.provider as UserRecord["provider"]) || "credentials",
          googleId: doc.googleId,
          githubToken: doc.githubToken,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    }
  } catch (err) {
    // If not a valid Convex ID or Convex unavailable
  }

  return memoryUsers.get(id) || null;
}

export async function createUser(data: {
  email: string;
  name: string;
  picture?: string;
  passwordHash?: string;
  provider: "google" | "credentials";
  googleId?: string;
  githubToken?: string;
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      const id = await convex.mutation(api.users.create, {
        email: normalizedEmail,
        name: data.name,
        picture: data.picture,
        passwordHash: data.passwordHash,
        provider: data.provider,
        googleId: data.googleId,
        githubToken: data.githubToken,
      });

      const user: UserRecord = {
        id: String(id),
        email: normalizedEmail,
        name: data.name,
        picture: data.picture,
        passwordHash: data.passwordHash,
        provider: data.provider,
        googleId: data.googleId,
        githubToken: data.githubToken,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      memoryUsers.set(user.id, user);
      return user;
    }
  } catch (err) {
    console.warn("Convex createUser failed, creating in local store:", err);
  }

  const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const user: UserRecord = {
    id,
    email: normalizedEmail,
    name: data.name,
    picture: data.picture,
    passwordHash: data.passwordHash,
    provider: data.provider,
    googleId: data.googleId,
    githubToken: data.githubToken,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  memoryUsers.set(id, user);
  return user;
}

export async function upsertGoogleUser(data: {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}): Promise<UserRecord> {
  const normalizedEmail = data.email.trim().toLowerCase();

  try {
    if (process.env.NEXT_PUBLIC_CONVEX_URL) {
      const id = await convex.mutation(api.users.upsertGoogleUser, {
        email: normalizedEmail,
        name: data.name,
        picture: data.picture,
        googleId: data.googleId,
      });

      const user: UserRecord = {
        id: String(id),
        email: normalizedEmail,
        name: data.name,
        picture: data.picture,
        provider: "google",
        googleId: data.googleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      memoryUsers.set(user.id, user);
      return user;
    }
  } catch (err) {
    console.warn("Convex upsertGoogleUser failed, upserting in local store:", err);
  }

  // Check if exists in memory
  let existing = await findUserByGoogleId(data.googleId);
  if (!existing) {
    existing = await findUserByEmail(normalizedEmail);
  }

  if (existing) {
    existing.name = data.name;
    if (data.picture) existing.picture = data.picture;
    existing.googleId = data.googleId;
    existing.updatedAt = Date.now();
    memoryUsers.set(existing.id, existing);
    return existing;
  }

  return await createUser({
    email: normalizedEmail,
    name: data.name,
    picture: data.picture,
    provider: "google",
    googleId: data.googleId,
  });
}
