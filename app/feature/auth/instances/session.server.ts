import { createCookieSessionStorage } from "@remix-run/node";

export const sessionStorage = createCookieSessionStorage({
	// a Cookie from `createCookie` or the same CookieOptions to create one
	cookie: {
		name: "__session",
		sameSite: "lax",
		maxAge: 30,
	},
});
