import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

export const getByGoogleId = query({
  args: { googleId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .first();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.string()),
    passwordHash: v.optional(v.string()),
    provider: v.string(),
    googleId: v.optional(v.string()),
    githubToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User already exists with this email address");
    }

    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      name: args.name,
      picture: args.picture,
      passwordHash: args.passwordHash,
      provider: args.provider,
      googleId: args.googleId,
      githubToken: args.githubToken,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const upsertGoogleUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    picture: v.optional(v.string()),
    googleId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase();
    
    // Check by googleId first
    let user = await ctx.db
      .query("users")
      .withIndex("by_googleId", (q) => q.eq("googleId", args.googleId))
      .first();

    // Check by email if not found by googleId
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .first();
    }

    const now = Date.now();

    if (user) {
      await ctx.db.patch(user._id, {
        name: args.name || user.name,
        picture: args.picture || user.picture,
        googleId: args.googleId,
        updatedAt: now,
      });
      return user._id;
    }

    const newUserId = await ctx.db.insert("users", {
      email: normalizedEmail,
      name: args.name,
      picture: args.picture,
      provider: "google",
      googleId: args.googleId,
      createdAt: now,
      updatedAt: now,
    });

    return newUserId;
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    picture: v.optional(v.string()),
    githubToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: Record<string, any> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.picture !== undefined) updates.picture = args.picture;
    if (args.githubToken !== undefined) updates.githubToken = args.githubToken;

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

