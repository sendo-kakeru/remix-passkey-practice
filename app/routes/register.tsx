import { Button, Input } from "@nextui-org/react";
import { Form } from "@remix-run/react";
import { FormEvent } from "react";
import { WebAuthnOptionsResponse, nanoid, startRegistration } from "remix-auth-webauthn/browser";

export default function Register() {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const email = formData.get("username")?.toString();
    if (!email) {
      throw new Error("メールアドレスが入力されていません。");
    }
    const response = await fetch(`${import.meta.env.VITE_APP_URL}/api/auth?username=${email}`);
    const options: WebAuthnOptionsResponse & {
      extra: unknown;
    } = await response.json();

    const responseValue = JSON.stringify(
      await startRegistration({
        challenge: options.challenge,
        excludeCredentials: options.authenticators,
        rp: options.rp,
        user: {
          id: nanoid(),
          name: email.split("@")[0],
          displayName: email.split("@")[0],
        },
        pubKeyCredParams: [
          {
            alg: -7,
            type: "public-key",
          },
          {
            alg: -257,
            type: "public-key",
          },
        ],
        timeout: 90 * 1000,
        attestation: "none",
        authenticatorSelection: {
          residentKey: "discouraged",
          requireResidentKey: false,
        },
        extensions: { credProps: true },
      })
    );
    const responseEl = Object.assign(document.createElement("input"), {
      type: "hidden",
      name: "response",
    });
    formElement.prepend(responseEl);
    responseEl.value = responseValue;

    const typeEl = Object.assign(document.createElement("input"), {
      type: "hidden",
      name: "type",
    });
    formElement.prepend(typeEl);
    typeEl.value = "registration";
    // const responseEl = {
    //   ...document.createElement("input"),
    //   type: "hidden",
    //   name: "response",
    //   value: responseValue,
    // };
    // formElement.prepend(responseEl);
    // const typeEl = {
    //   ...document.createElement("input"),
    //   type: "hidden",
    //   name: "type",
    //   value: "registration",
    // };
    formElement.prepend(typeEl);
    // formElement.action = `/api/auth?username=${email}`;
    console.log("formElement", formElement);
    // formElement.submit();
  }
  return (
    <div className="relative h-[100svh] w-full flex flex-col justify-center items-center">
      <div className="w-full max-w-[360px] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 mb-12">
          <h1 className="font-semibold text-lg">Okashibu</h1>
        </div>
        <Form
          action="/api/auth"
          method="post"
          onSubmit={handleSubmit}
          className="w-full flex flex-col justify-center gap-4"
        >
          <Input label="メールアドレス" type="email" name="username" variant="bordered" />
          <Button type="submit" color="primary" radius="full">
            登録する
          </Button>
        </Form>
      </div>
    </div>
  );
}
