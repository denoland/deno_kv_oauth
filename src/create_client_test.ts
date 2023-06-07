// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { assertEquals, assertThrows } from "../deps.ts";
import { createClient } from "./create_client.ts";

Deno.test("createClient()", async (test) => {
  await test.step("non-existent provider", () => {
    // @ts-ignore Trust me
    assertThrows(() => createClient("acme"));
  });

  await test.step("discord", () => {
    assertThrows(() => createClient("discord"));
    assertThrows(() =>
      createClient("discord", {
        defaults: { scope: "scope_without_redirect_url" },
      })
    );
    assertThrows(() =>
      createClient("discord", {
        redirectUri: "http://redirect-without-scope.com",
      })
    );

    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    Deno.env.set("DISCORD_CLIENT_ID", clientId);
    Deno.env.set("DISCORD_CLIENT_SECRET", clientSecret);

    const client = createClient("discord", { redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  });

  await test.step("github", () => {
    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    Deno.env.set("GITHUB_CLIENT_ID", clientId);
    Deno.env.set("GITHUB_CLIENT_SECRET", clientSecret);

    const client = createClient("github", { redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  });

  await test.step("gitlab", () => {
    assertThrows(() => createClient("gitlab"));
    assertThrows(() =>
      createClient("gitlab", {
        defaults: { scope: "scope_without_redirect_url" },
      })
    );
    assertThrows(() =>
      createClient("gitlab", {
        redirectUri: "http://redirect-without-scope.com",
      })
    );

    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    Deno.env.set("GITLAB_CLIENT_ID", clientId);
    Deno.env.set("GITLAB_CLIENT_SECRET", clientSecret);

    const client = createClient("gitlab", { redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  });

  await test.step("google", () => {
    assertThrows(() => createClient("google"));
    assertThrows(() =>
      createClient("google", {
        defaults: { scope: "scope_without_redirect_url" },
      })
    );
    assertThrows(() =>
      createClient("google", {
        redirectUri: "http://redirect-without-scope.com",
      })
    );

    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const redirectUri = "http://example.com";
    const defaults = { scope: "scope" };

    Deno.env.set("GOOGLE_CLIENT_ID", clientId);
    Deno.env.set("GOOGLE_CLIENT_SECRET", clientSecret);

    const client = createClient("google", { redirectUri, defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.redirectUri, redirectUri);
    assertEquals(client.config.defaults, defaults);
  });

  await test.step("slack", () => {
    assertThrows(() => createClient("slack"));

    const clientId = crypto.randomUUID();
    const clientSecret = crypto.randomUUID();
    const defaults = { scope: "scope" };

    Deno.env.set("SLACK_CLIENT_ID", clientId);
    Deno.env.set("SLACK_CLIENT_SECRET", clientSecret);

    const client = createClient("slack", { defaults });
    assertEquals(client.config.clientId, clientId);
    assertEquals(client.config.clientSecret, clientSecret);
    assertEquals(client.config.defaults, defaults);
  });
});
