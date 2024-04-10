import { Button, NextUIProvider, User } from "@nextui-org/react";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/node";
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from "@remix-run/react";
import stylesheet from "~/styles/tailwind.css?url";
import { remixAuthenticator } from "./feature/auth/instances/authenticator.server";

export const links: LinksFunction = () => [{ rel: "stylesheet", href: stylesheet }];

export async function loader({ request }: LoaderFunctionArgs) {
	const user = await remixAuthenticator.isAuthenticated(request);
	return json({
		user,
	});
}
export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	const loaderData = useLoaderData<typeof loader>();

	return (
		<NextUIProvider>
			<header className="p-4 border-b">
				{loaderData.user ? (
					<>
						<User name={loaderData.user.name} />
						<Form method="POST" action="/api/auth/signout">
							<Button type="submit" color="danger">
								ログアウト
							</Button>
						</Form>
					</>
				) : (
					<Button to="/register" as={Link}>
						サインイン
					</Button>
				)}
			</header>
			<Outlet />
		</NextUIProvider>
	);
}
