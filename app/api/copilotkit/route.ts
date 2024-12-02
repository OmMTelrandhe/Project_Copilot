// import { Action } from "@copilotkit/shared";
// import { researchWithLangGraph } from "./research";

// import { NextRequest } from "next/server";
// import {
//   CopilotRuntime,
//   OpenAIAdapter,
//   copilotRuntimeNextJSAppRouterEndpoint,
// } from "@copilotkit/runtime";
// import OpenAI from "openai";

// const AZURE_OPENAI_API_KEY = "AZURE_API_KEY";

// const researchAction: Action<any> = {
//   name: "research",
//   description:
//     "Call this function to conduct research on a certain topic. Respect other notes about when to call this function",
//   parameters: [
//     {
//       name: "topic",
//       type: "string",
//       description: "The topic to research. 5 characters or longer.",
//     },
//   ],
//   handler: async ({ topic }) => {
//     console.log("Researching topic: ", topic);
//     return await researchWithLangGraph(topic);
//   },
// };

// export const POST = async (req: NextRequest) => {
//   const actions: Action<any>[] = [];
//   if (
//     process.env["TAVILY_API_KEY"] &&
//     process.env["TAVILY_API_KEY"] !== "NONE"
//   ) {
//     actions.push(researchAction);
//   }
//   const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
//     runtime: new CopilotRuntime({
//       actions: actions,
//     }),
//     serviceAdapter: new OpenAIAdapter(),
//     endpoint: req.nextUrl.pathname,
//   });
//   return handleRequest(req);
// };




import { Action } from "@copilotkit/shared";
import { researchWithLangGraph } from "./research";

import { NextRequest } from "next/server";
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";

// Azure OpenAI Configuration
const instance = "viresh-v2"; // Replace with your Azure OpenAI instance name
const model = "gpt-4o"; // Replace with your model deployment name
const apiVersion = "2023-03-15-preview"; // Use the correct API version for Azure

const AZURE_OPENAI_API_KEY = "AZURE_API_KEY"; // Use your environment variable name

const researchAction: Action<any> = {
  name: "research",
  description:
    "Call this function to conduct research on a certain topic. Respect other notes about when to call this function",
  parameters: [
    {
      name: "topic",
      type: "string",
      description: "The topic to research. 5 characters or longer.",
    },
  ],
  handler: async ({ topic }) => {
    console.log("Researching topic: ", topic);
    return await researchWithLangGraph(topic);
  },
};

export const POST = async (req: NextRequest) => {
  const actions: Action<any>[] = [];

  if (
    process.env["TAVILY_API_KEY"] &&
    process.env["TAVILY_API_KEY"] !== "NONE"
  ) {
    actions.push(researchAction);
  }

  // Retrieve the Azure OpenAI API Key from the environment variables
  const apiKey = process.env[AZURE_OPENAI_API_KEY];
  if (!apiKey) {
    throw new Error(
      "The AZURE_OPENAI_API_KEY environment variable is missing or empty."
    );
  }

  // Initialize the OpenAI client with Azure-specific configurations
  const openai = new OpenAI({
    apiKey, // Use the Azure OpenAI API key
    baseURL: `https://${instance}.openai.azure.com/openai/deployments/${model}`, // Azure-specific endpoint
  
    // baseURL: `https://viresh.openai.azure.com/`, // Azure-specific endpoint

    defaultQuery: { "api-version": apiVersion }, // Set the API version for Azure
    defaultHeaders: { "api-key": apiKey }, // Set the API key in headers
  });

  // Initialize the service adapter with the Azure OpenAI client
  const serviceAdapter = new OpenAIAdapter({ openai });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: new CopilotRuntime({
      actions: actions,
    }),
    serviceAdapter, // Use the service adapter initialized with Azure OpenAI
    endpoint: req.nextUrl.pathname,
  });

  return handleRequest(req);
};
