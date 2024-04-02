import { Button } from "@nextui-org/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import { authenticator, webAuthnStrategy } from "~/feature/auth/instances/authenticator.server";
import { sessionStorage } from "~/feature/auth/instances/session.server";

export const meta: MetaFunction = () => {
	return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};
export async function loader({ request }: LoaderFunctionArgs) {
	const user = await authenticator.isAuthenticated(request);

	return webAuthnStrategy.generateOptions(request, sessionStorage, user);
}

export async function action({ request }: ActionFunctionArgs) {
	try {
		await authenticator.authenticate("webauthn", request, {
			successRedirect: "/",
		});
		return { error: null };
	} catch (error) {
		// This allows us to return errors to the page without triggering the error boundary.
		if (error instanceof Response && error.status >= 400) {
			return { error: (await error.json()) as { message: string } };
		}
		throw error;
	}
}

export default function Login() {
	const options = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();

	return (
		<Form onSubmit={handleFormSubmit(options)} method="POST">
			<Button>aaaaaaa</Button>
			<label>
				Username
				<input type="text" name="username" />
			</label>
			<button formMethod="GET">Check Username</button>
			<button name="intent" value="registration" disabled={options.usernameAvailable !== true}>
				Register
			</button>
			<button name="intent" value="authentication">
				Authenticate
			</button>
			{actionData?.error ? <div>{actionData.error.message}</div> : null}
		</Form>
	);
}
