import { betterAuth } from "better-auth";
import { emailOTP, openAPI } from "better-auth/plugins";
import { Pool } from "pg";
import { Redis } from "ioredis"
import { sendOTPEmail } from "./email";
import * as bcrypt from "bcryptjs";
import { expo } from "@better-auth/expo";

const redis = new Redis(`${process.env.REDIS_URL}?family=0`)
	.on("error", (err) => {
		console.error("Redis connection error:", err)
	})
	.on("connect", () => {
		console.log("Redis connected")
	})
	.on("ready", () => {
		console.log("Redis ready")
	})

// Check better-auth docs for more info https://www.better-auth.com/docs/
export const auth = betterAuth({
	trustedOrigins: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3001", "myapp://"],
	emailAndPassword: {
		enabled: true,
		password: {
			hash: async (password: string): Promise<string> => {
				// switch to bcrypt
				const saltRounds = 10;
				return await bcrypt.hash(password, saltRounds);
			},
			verify: async (data: { hash: string; password: string; }): Promise<boolean> => {
				return await bcrypt.compare(data.password, data.hash);
			}
		}
	},
	// Session config
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
	// Add your plugins here
	plugins: [
		openAPI(),
		expo(),
		emailOTP({
			async sendVerificationOTP({ email, otp, type }) {
				try {
					await sendOTPEmail(email, otp, type);
				} catch (error) {
					console.error("send verification otp error:", error);
				}
			},
			sendVerificationOnSignUp: false,
		})
	],
	// rate limit config
	rateLimit: {
		enabled: true,
		storage: "secondary-storage",
		customRules: {
			"/email-otp/send-verification-otp": {
				window: 60,
				max: 1,
			},
		},
	},
	// DB config
	database: new Pool({
		connectionString: process.env.DATABASE_URL,
		log: console.log,
	}),
	// This is for the redis session storage
	secondaryStorage: {
		get: async (key) => {
			const value = await redis.get(key);
			return value ? value : null;
		},
		set: async (key, value, ttl) => {
			if (ttl) {
				await redis.set(key, value, "EX", ttl);
			} else {
				await redis.set(key, value);
			}
		},
		delete: async (key) => {
			await redis.del(key);
		},
	},
	user: {
		modelName: "user",
		fields: {
			emailVerified: "email_verified",
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	},
	account: {
		modelName: "account",
		fields: {
			accountId: "account_id",
			providerId: "provider_id",
			userId: "user_id",
			accessToken: "access_token",
			refreshToken: "refresh_token",
			idToken: "id_token",
			accessTokenExpiresAt: "access_token_expires_at",
			refreshTokenExpiresAt: "refresh_token_expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	},
	verification: {
		modelName: "verification",
		fields: {
			expiresAt: "expires_at",
			createdAt: "created_at",
			updatedAt: "updated_at"
		}
	},
});
