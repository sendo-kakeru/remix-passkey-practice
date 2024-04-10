import { Link } from "@nextui-org/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
	return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

export default function Login() {
	return <Link href="/register">サインイン</Link>;
}
