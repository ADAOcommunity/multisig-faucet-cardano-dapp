export async function postToSign(amount = 1): Promise<{ data: number }> {
  const response = await fetch('/api/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });
  const result = await response.json();

  return result;
}
