import OpenAI from "openai";

export async function research(query: string) {
  const response = await fetch("https://api..com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env._API_KEY,
      query,
      search_depth: "basic",
      include_answer: true,
      include_images: false,
      include_raw_content: false,
      max_results: 20,
    }),
  });

  const responseJson = await response.json();
  const openai = new OpenAI();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Summarize the following JSON to answer the research query \`"${query}"\`: ${JSON.stringify(
          responseJson
        )} in plain English.`,
      },
    ],
    model: process.env.AZURE_DEPLOYMENT_NAME || "gpt-4o",
  });

  return completion.choices[0].message.content;
}



// // Import OpenAI from the appropriate module
// import { OpenAI } from "openai";

// // Define types for Tavily response
// interface TavilySearchResult {
//   title: string;
//   snippet: string;
//   url: string;
// }

// interface TavilyResponse {
//   results: TavilySearchResult[];
//   query: string;
// }

// // Define type for OpenAI completion response
// interface OpenAICompletionChoice {
//   message: {
//     content: string | null; // Adjusted to match the actual type
//   };
// }

// interface OpenAICompletionResponse {
//   choices: OpenAICompletionChoice[];
// }

// // Research function
// export async function research(query: string): Promise<string> {
//   // Validate environment variables
//   if (!process.env.TAVILY_API_KEY) {
//     throw new Error("TAVILY_API_KEY is not set in the environment variables.");
//   }

//   if (!process.env.AZURE_API_KEY) {
//     throw new Error("AZURE_API_KEY is not set in the environment variables.");
//   }

//   if (!process.env.AZURE_DEPLOYMENT_NAME) {
//     throw new Error("AZURE_DEPLOYMENT_NAME is not set in the environment variables.");
//   }

//   try {
//     // Tavily API request
//     const tavilyResponse = await fetch("https://api.tavily.com/search", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         api_key: process.env.TAVILY_API_KEY,
//         query,
//         search_depth: "basic",
//         include_answer: true,
//         include_images: false,
//         include_raw_content: false,
//         max_results: 20,
//       }),
//     });

//     if (!tavilyResponse.ok) {
//       throw new Error(
//         `Tavily API error: ${tavilyResponse.status} ${tavilyResponse.statusText}`
//       );
//     }

//     const responseJson: TavilyResponse = await tavilyResponse.json();

//     // Azure OpenAI API configuration
//     const openai = new OpenAI({
//       apiKey: process.env.AZURE_API_KEY,
//       baseURL: `${process.env.AZURE_API_BASE}/openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=${process.env.AZURE_API_VERSION}`,
//       defaultHeaders: {
//         "api-key": process.env.AZURE_API_KEY,
//         "Content-Type": "application/json",
//       },
//     });

//     // Azure OpenAI request
//     const completion: OpenAICompletionResponse = await openai.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `Summarize the following JSON to answer the research query "${query}": ${JSON.stringify(
//             responseJson
//           )} in plain English.`,
//         },
//       ],
//       model: process.env.AZURE_DEPLOYMENT_NAME as string,
//     });

//     // Ensure content is a string before returning
//     return completion.choices[0].message.content || "No content available";
//   } catch (error) {
//     console.error("An error occurred during the research process:", error);
//     throw new Error("Failed to complete the research request.");
//   }
// }
