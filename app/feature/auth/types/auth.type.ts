import { Authenticator, User } from "@prisma/client";

export type UserInAuthenticators = User & {
	authenticators: Authenticator[];
};
