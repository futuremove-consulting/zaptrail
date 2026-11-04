export async function GET(): Promise<Response> {
  return new Response(
    JSON.stringify({
      status: 'ok',
      service: 'zaptrail',
      version: '1.1.0',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'cache-control': 'no-store',
      },
    },
  );
}
