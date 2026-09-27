export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only /download
    if (url.pathname !== "/download") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Endpoint not found"
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Get original video URL
    const videoURL = url.searchParams.get("url");

    if (!videoURL) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing URL"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    try {
      // Downloader API
      const apiURL =
        "https://tdownv4.sl-bjs.workers.dev/?down=" +
        encodeURIComponent(videoURL);

      const response = await fetch(apiURL);

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Downloader API error",
            status: response.status
          }),
          {
            status: 502,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      const data = await response.json();

      if (!data || !data.download_url) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "No download URL returned",
            data: data
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Return only what the bot needs
      return new Response(
        JSON.stringify({
          success: true,
          title: data.title || null,
          download_url: data.download_url
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store"
          }
        }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to process URL"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};
