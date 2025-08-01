// This file will handle geocoding requests by proxying them to the backend.
// The backend is assumed to be running on http://localhost:8000.

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');

  if (!location) {
    return new Response(JSON.stringify({ error: 'Location parameter is missing' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Assuming your backend is running on http://localhost:8000
    const backendUrl = `http://localhost:8000/geocode?location=${encodeURIComponent(location)}`;
    const response = await fetch(backendUrl);

    if (!response.ok) {
      // If the backend returns an error, propagate it
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error proxying geocode request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}