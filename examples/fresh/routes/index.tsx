// deno-lint-ignore-file no-explicit-any
import { Handlers, PageProps } from "$fresh/server.ts";
import { getUser, isSignedIn } from "deno_kv_oauth";

interface Data {
  user?: any;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const user = isSignedIn(req) ? await getUser(req, "github") : undefined;
    return ctx.render({ user });
  },
};

export default function Home(props: PageProps<Data>) {
  const { user } = props.data;
  return (
    <>
      <p>
        {user ? `Hello, ${user.login}` : "Who are you?"}
      </p>
      {user ? <a href="/signout">Sign out</a> : <a href="/signin">Sign in</a>}
    </>
  );
}
