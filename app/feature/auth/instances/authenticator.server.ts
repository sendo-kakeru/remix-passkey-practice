// /app/authenticator.server.ts
import { WebAuthnStrategy } from "remix-auth-webauthn/server";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";
import prisma from "~/instances/prisma";
import { UserInAuthenticators } from "../types/auth.type";

export const remixAuthenticator = new Authenticator<UserInAuthenticators>(sessionStorage);
export const webAuthnStrategy = new WebAuthnStrategy<UserInAuthenticators>(
	{
		rpName: "Okashibu App",
		rpID: (request) => new URL(request.url).hostname,
		origin: (request) => new URL(request.url).origin,
		// このユーザに関連付けられている認証子の一覧を返します。
		getUserAuthenticators: async (user) => {
			if (!user) return [];
			const authenticators = await prisma.authenticator.findMany({
				where: {
					userId: user.id,
				},
			});
			return authenticators.map((authenticator) => ({
				...authenticator,
				transports: authenticator.transports.split(","),
			}));
		},
		// ユーザーオブジェクトをストラテジーが期待する形状に変換する。Transform the user object into the shape expected by the strategy.
		// 通常のユーザー名、ユーザーのメールアドレス、または他の何かを使用することができます。You can use a regular username, the users email address, or something else.
		getUserDetails: (user) => {
			if (user && user.email) {
				return { id: user.id, username: user.email, displayName: `displayName ${user.name}` };
			}
			return null;
		},
		// データベースからユーザ名/メールアドレスでユーザを探します。Find a user in the database with their username/email.
		getUserByUsername: (email) =>
			prisma.user.findUnique({ where: { email }, include: { authenticators: true } }),
		getAuthenticatorById: (id) => {
			return prisma.authenticator.findUnique({ where: { credentialID: id } });
		},
	},
	async function verify({ authenticator, type, username }) {
		let user: UserInAuthenticators | null = null;
		const savedAuthenticator = await prisma.authenticator.findUnique({
			where: { credentialID: authenticator.credentialID },
		});
		if (type === "registration") {
			// ユーザー作成時
			// 認証者がデータベースに存在するかチェックするCheck if the authenticator exists in the database
			if (savedAuthenticator) {
				throw new Error("Authenticatorは既に登録されています");
			} else {
				if (!username) throw new Error("ユーザー名が必要です。");
				user = await prisma.user.findUnique({
					where: { email: username },
					include: { authenticators: true },
				});

				// のパスキーの登録を許可しない。
				// 他人のアカウントのパスキーを登録できないようにしてください。
				if (user) throw new Error("ユーザは既に存在します。");

				// 新しいユーザーと認証者を作成する
				user = await prisma.user.create({
					data: {
						name: username.split("@")[0],
						slug: username.split("@")[0],
						email: username,
						authenticators: {
							create: {
								...authenticator,
							},
						},
					},
					include: { authenticators: true },
				});
			}
		} else if (type === "authentication") {
			// ユーザー認証時
			if (!savedAuthenticator) throw new Error("認証機器が見つかりません");
			user = await prisma.user.findUnique({
				where: { id: savedAuthenticator.userId },
				include: { authenticators: true },
			});
		}

		if (!user) throw new Error("User not found");
		return user;
	}
);

remixAuthenticator.use(webAuthnStrategy);
