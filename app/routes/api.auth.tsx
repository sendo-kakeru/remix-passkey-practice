import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  remixAuthenticator,
  webAuthnStrategy,
} from "~/feature/auth/instances/authenticator.server";
import { sessionStorage } from "~/feature/auth/instances/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await remixAuthenticator.isAuthenticated(request);

  return webAuthnStrategy.generateOptions(request, sessionStorage, user);
}

export async function action({ request }: ActionFunctionArgs) {
  await remixAuthenticator.authenticate("webauthn", request, {
    successRedirect: "/",
    // failureRedirect: "/login",
    throwOnError: true,
  });
}
