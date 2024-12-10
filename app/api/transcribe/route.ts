export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("File not provided", { status: 400 });
    }

    const azureBaseUrl = process.env.AZURE_API_BASE;
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME;
    const apiKey = process.env.AZURE_API_KEY;
    const apiVersion = process.env.AZURE_API_VERSION;

    if (!azureBaseUrl || !deploymentName || !apiKey || !apiVersion) {
      throw new Error("Azure API configuration is missing in the environment variables");
    }

    const response = await fetch(
      `${azureBaseUrl}openai/deployments/${deploymentName}/audio/transcriptions?api-version=${apiVersion}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          "api-key": apiKey,
        },
        body: file,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ error }), { status: response.status });
    }

    const transcription = await response.json();
    return new Response(JSON.stringify(transcription), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
