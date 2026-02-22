import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

// Helper function to generate a random token
function generateToken() {
    return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

export const createInitialAdmin = mutation({
    args: { username: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const existingAdmins = await ctx.db.query("adminUsers").collect();
        if (existingAdmins.length > 0) {
            throw new Error("Admin user already exists");
        }

        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(args.password, salt);

        await ctx.db.insert("adminUsers", {
            username: args.username,
            passwordHash: passwordHash,
        });

        return "Admin created successfully";
    },
});

export const login = mutation({
    args: { username: v.string(), password: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("adminUsers")
            .withIndex("by_username", (q) => q.eq("username", args.username))
            .first();

        if (!user) {
            throw new Error("Invalid username or password");
        }

        const isMatch = bcrypt.compareSync(args.password, user.passwordHash);

        if (!isMatch) {
            throw new Error("Invalid username or password");
        }

        const token = generateToken();
        const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

        await ctx.db.insert("adminSessions", {
            userId: user._id,
            token,
            expiresAt,
        });

        return token;
    },
});

export const validateSession = query({
    args: { token: v.optional(v.string()) },
    handler: async (ctx, args) => {
        if (!args.token) return false;

        const session = await ctx.db
            .query("adminSessions")
            .withIndex("by_token", (q) => q.eq("token", args.token as string))
            .first();

        if (!session) return false;

        if (session.expiresAt < Date.now()) {
            return false;
        }

        return true;
    },
});

export const logout = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("adminSessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .first();

        if (session) {
            await ctx.db.delete(session._id);
        }
    },
});
