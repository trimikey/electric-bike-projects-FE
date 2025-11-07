export async function refreshAccessToken(refreshToken: string) {
  const url = `${process.env.NEXT_PUBLIC_BE_URL}/auth/refresh`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) throw new Error("Refresh token failed");
  return res.json() as Promise<{ accessToken: string }>;
}
