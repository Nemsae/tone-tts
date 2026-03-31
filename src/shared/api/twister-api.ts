import type { Twister, TwisterLength } from '@/shared/vendor';

interface GenerateTwistersRequest {
  topic: string;
  length: TwisterLength;
  customLength?: number;
  rounds?: number;
}

interface GenerateTwistersResponse {
  twisters: Twister[];
}

export async function generateTwisters({
  topic,
  length,
  customLength,
  rounds = 1,
}: GenerateTwistersRequest): Promise<Twister[]> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      length,
      ...(length === 'custom' && customLength !== undefined && { customLength }),
      rounds,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data: GenerateTwistersResponse = await response.json();
  return data.twisters;
}
