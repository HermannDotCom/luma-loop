import { describe, expect, it } from "vitest";

const expoToken = process.env.EXPO_TOKEN;

describe("Expo build authentication", () => {
  it.skipIf(!expoToken)("validates the configured access token against Expo's viewer endpoint", async () => {
    const response = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${expoToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: "query { viewer { username } }" }),
    });
    const payload = await response.json() as { data?: { viewer?: { username?: string } }; errors?: Array<{ message?: string }> };

    expect(response.ok, JSON.stringify(payload.errors ?? [])).toBe(true);
    expect(payload.errors ?? []).toHaveLength(0);
    expect(payload.data?.viewer?.username).toBe("hermanndotcom");
  });
});
