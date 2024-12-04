import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, END, START } from "@langchain/langgraph";
import { RunnableLambda } from "@langchain/core/runnables";
import { TavilySearchAPIRetriever } from "@langchain/community/retrievers/tavily_search_api";

interface AgentState {
  topic: string;
  searchResults?: string;
  article?: string;
  critique?: string;
}

function model() {
  return new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo-0125",
  });
}

async function search(state: { agentState: AgentState }) {
  const retriever = new TavilySearchAPIRetriever({ k: 10 });
  let topic = state.agentState.topic.trim();
  if (topic.length < 5) {
    topic = "topic: " + topic;
  }
  const docs = await retriever.getRelevantDocuments(topic).catch((err) => {
    console.error("Search API Error:", err);
    return [];
  });

  return {
    agentState: {
      ...state.agentState,
      searchResults: JSON.stringify(docs),
    },
  };
}

async function curate(state: { agentState: AgentState }) {
  const response = await model().invoke([
    new SystemMessage(
      `You are a personal newspaper editor. Return a list of URLs of the 5 most relevant articles as a JSON list of strings in the format:
      { urls: ["url1", "url2", "url3", "url4", "url5"] }`
    ),
    new HumanMessage(
      `Today's date is ${new Date().toLocaleDateString("en-GB")}.
      Topic: ${state.agentState.topic}
      Articles: ${state.agentState.searchResults || "[]"}`
    ),
  ]);

  let urls: string[] = [];
  try {
    urls = JSON.parse(response.content as string).urls;
  } catch (error) {
    console.error("Curate Response Parsing Error:", error);
  }

  const searchResults = JSON.parse(state.agentState.searchResults || "[]");
  const newSearchResults = searchResults.filter((result: any) =>
    urls.includes(result.metadata.source)
  );

  return {
    agentState: {
      ...state.agentState,
      searchResults: JSON.stringify(newSearchResults),
    },
  };
}

async function write(state: { agentState: AgentState }) {
  const response = await model().invoke([
    new SystemMessage(
      `You are a newspaper writer. Write a well-written article of 5 paragraphs in markdown based on the topic and sources provided.`
    ),
    new HumanMessage(
      `Today's date: ${new Date().toLocaleDateString("en-GB")}.
      Topic: ${state.agentState.topic}
      Sources: ${state.agentState.searchResults || "[]"}`
    ),
  ]);

  return {
    agentState: {
      ...state.agentState,
      article: response.content as string,
    },
  };
}

async function critique(state: { agentState: AgentState }) {
  const critiqueResponse = await model().invoke([
    new SystemMessage(
      `You are a writing critique. Provide short feedback if necessary or return [DONE] if the article is satisfactory.`
    ),
    new HumanMessage(
      `Article: ${state.agentState.article || ""}
      Critique: ${state.agentState.critique || ""}`
    ),
  ]);

  const critiqueContent = critiqueResponse.content as string;

  return {
    agentState: {
      ...state.agentState,
      critique: critiqueContent.includes("[DONE]") ? undefined : critiqueContent,
    },
  };
}

async function revise(state: { agentState: AgentState }) {
  const revisionResponse = await model().invoke([
    new SystemMessage(
      `You are an editor. Revise the article based on the critique provided.`
    ),
    new HumanMessage(
      `Article: ${state.agentState.article || ""}
      Critique: ${state.agentState.critique || ""}`
    ),
  ]);

  return {
    agentState: {
      ...state.agentState,
      article: revisionResponse.content as string,
    },
  };
}

const workflow = new StateGraph({
  channels: {
    agentState: {
      value: (x: AgentState, y: AgentState) => ({ ...x, ...y }),
      default: () => ({
        topic: "",
        searchResults: "",
        article: "",
        critique: "",
      }),
    },
    channels: null
  },
});

// Add all nodes properly
workflow.addNode("search", new RunnableLambda({ func: search }));
workflow.addNode("curate", new RunnableLambda({ func: curate }));
workflow.addNode("write", new RunnableLambda({ func: write }));
workflow.addNode("critique", new RunnableLambda({ func: critique }));
workflow.addNode("revise", new RunnableLambda({ func: revise }));

// Ensure the edges are between valid nodes
workflow.addEdge(START, "search");
workflow.addEdge("search", "curate");
workflow.addEdge("curate", "write");
workflow.addEdge("write", "critique");
// workflow.addConditionalEdges("critique", shouldContinue, {
//   continue: "revise",
//   end: END,
// });
workflow.addEdge("revise", "critique");

const app = workflow.compile();

// Helper function for critiquing
function shouldContinue(state: { agentState: AgentState }) {
  return state.agentState.critique ? "continue" : "end";
}

export async function researchWithLangGraph(topic: string) {
  const inputs = {
    agentState: {
      topic,
    },
  };
  const result = await app.invoke(inputs);
  return result.agentState.article.replace(/<FEEDBACK>[\s\S]*?<\/FEEDBACK>/g, "");
}

