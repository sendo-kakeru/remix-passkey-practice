import { Button, Input } from "@nextui-org/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import {
	remixAuthenticator,
	webAuthnStrategy,
} from "~/feature/auth/instances/authenticator.server";
import { sessionStorage } from "~/feature/auth/instances/session.server";

// export async function loader({ request }: LoaderFunctionArgs) {
// 	const res = await fetch("http://localhost:5173/api/auth");
// 	const result: WebAuthnOptionsResponse & {
// 		extra: unknown;
// 	} = await res.json();
// 	return result;
// }
export async function loader({ request }: LoaderFunctionArgs) {
	const user = await remixAuthenticator.isAuthenticated(request);

	return webAuthnStrategy.generateOptions(request, sessionStorage, user);
}

export async function action({ request }: ActionFunctionArgs) {
	await remixAuthenticator.authenticate("webauthn", request, {
		successRedirect: "/",
	});
}

export default function SignIn() {
	const options = useLoaderData<typeof loader>();
	return (
    <div className="flex flex-col justify-center p-8">
		<Form
			onSubmit={handleFormSubmit(options)}
			// action="/api/auth"
			method="POST"
			className="flex flex-col gap-4 max-w-80 m-auto"
      >
			<Input type="text" label="username" name="username" />
			<Button formAction="/signin" formMethod="GET" type="submit">
				ユーザーネームを確認
			</Button>
			<Button
				name="intent"
				value="registration"
				formAction="/api/auth"
				disabled={options.usernameAvailable !== true}
				type="submit"
        >
				新規登録
			</Button>
			<Button name="intent" value="authentication" type="submit" formAction="/api/auth">
				ログイン
			</Button>
			{/* {actionData?.error ? <div>{actionData.error.message}</div> : null} */}
		</Form>
        </div>
	);
}
