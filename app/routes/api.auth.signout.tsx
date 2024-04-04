import { ActionFunctionArgs } from "@remix-run/node";
import { remixAuthenticator } from "~/feature/auth/instances/authenticator.server";

export async function action({ request }: ActionFunctionArgs) {
  await remixAuthenticator.logout(request, { redirectTo: "/" });
}
