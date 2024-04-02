// /app/authenticator.server.ts
import { WebAuthnStrategy } from "remix-auth-webauthn/server";
import {
	getAuthenticators,
	getUserByUsername,
	getAuthenticatorById,
	type User,
	createUser,
	createAuthenticator,
	getUserById,
} from "../functions/db.server";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session.server";

// Authenticatorは認証機器
// transportは認証機器の通信プロトコル
export const authenticator = new Authenticator<User>(sessionStorage);

export const webAuthnStrategy = new WebAuthnStrategy<User>(
	{
		// 人間が読めるアプリ名The human-readable name of your app
		// Type: string | (response:Response) => Promise<string> | string
		rpName: "Okashibu App",
		// ウェブサイトのホスト名で、パスキーが使用できる場所を決定する。The hostname of the website, determines where passkeys can be used
		// See https://www.w3.org/TR/webauthn-2/#relying-party-identifier
		// Type: string | (response:Response) => Promise<string> | string
		rpID: request => new URL(request.url).hostname,
		// 登録を行うウェブサイトの URL (または URL の配列)Website URL (or array of URLs) where the registration can occur
		origin: request => new URL(request.url).origin,
		// このユーザに関連付けられている認証子の一覧を返します。以下のようになります。Return the list of authenticators associated with this user. You might
		// を文字列のリストに変換する必要があるかもしれません。need to transform a CSV string into a list of strings at this step.
		getUserAuthenticators: async user => {
			const authenticators = await getAuthenticators(user);

			return authenticators.map(authenticator => ({
				...authenticator,
				transports: authenticator.transports.split(","),
			}));
		},
		// ユーザーオブジェクトをストラテジーが期待する形状に変換する。Transform the user object into the shape expected by the strategy.
		// 通常のユーザー名、ユーザーのメールアドレス、または他の何かを使用することができます。You can use a regular username, the users email address, or something else.
		getUserDetails: user => (user ? { id: user.id, username: user.username } : null),
		// データベースからユーザ名/メールアドレスでユーザを探します。Find a user in the database with their username/email.
		getUserByUsername: username => getUserByUsername(username),
		getAuthenticatorById: id => getAuthenticatorById(id),
	},
	async function verify({ authenticator, type, username }) {
		let user: User | null = null;
		const savedAuthenticator = await getAuthenticatorById(authenticator.credentialID);
		if (type === "registration") {
			// ユーザー作成時
			// 認証者がデータベースに存在するかチェックするCheck if the authenticator exists in the database
			if (savedAuthenticator) {
				throw new Error("Authenticator has already been registered.");
			} else {
				// ユーザ名は認証の検証には使用しません、Username is null for authentication verification,
				// しかし、登録認証には必要です。but required for registration verification.
				// このエラーが投げられることはまずないだろう、It is unlikely this error will ever be thrown,
				// しかし、TypeScriptのチェックに役立ちます。but it helps with the TypeScript checking
				if (!username) throw new Error("Username is required.");
				user = await getUserByUsername(username);

				// のパスキーの登録を許可しない。
				// 他人のアカウントのパスキーを登録できないようにしてください。
				if (user) throw new Error("User already exists.");

				// 新しいユーザーと認証者を作成する
				user = await createUser(username);
				await createAuthenticator(authenticator, user.id);
			}
		} else if (type === "authentication") {
			// ユーザー認証時
			if (!savedAuthenticator) throw new Error("Authenticator not found");
			user = await getUserById(savedAuthenticator.userId);
		}

		if (!user) throw new Error("User not found");
		return user;
	}
);

authenticator.use(webAuthnStrategy);