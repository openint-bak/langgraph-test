import type {AIMessage, BaseMessage} from '@langchain/core/messages'
import {HumanMessage} from '@langchain/core/messages'
import {tool} from '@langchain/core/tools'
import {z} from 'zod'
import {ChatAnthropic} from '@langchain/anthropic'
import type {StateGraphArgs} from '@langchain/langgraph'
import {StateGraph} from '@langchain/langgraph'
import {MemorySaver} from '@langchain/langgraph'
import {ToolNode} from '@langchain/langgraph/prebuilt'
import {coda} from './coda.js'

// Define the state interface
interface AgentState {
  messages: BaseMessage[]
}

// Define the graph state
const graphState: StateGraphArgs<AgentState>['channels'] = {
  messages: {
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
  },
}

// const codaTool = tool(
//   async ({query}) => {
//     const docs = await coda.GET('/docs').then((r) => r.data)
//     return docs.items.map((item) => item.name).join(', ')
//   },
//   {
//     name: 'coda',
//     description: 'Call to list the set of docs availab in Coda',
//     schema: z.object({
//       query: z.string().describe('The query to use in your search.'),
//     }),
//   },
// )
const codaTool = tool(
  async ({title, subtitle, content}) => {
    await coda.POST('/docs/{docId}/pages', {
      params: {path: {docId: '0slx_kawnH'}},
      body: {
        name: title,
        subtitle,
        iconName: 'rocket',
        imageUrl: 'https://example.com/image.jpg',
        pageContent: {
          type: 'canvas',
          canvasContent: {
            format: 'markdown',
            content: content ?? '',
          },
        },
      },
    })
    const docs = await coda.GET('/docs').then((r) => r.data)
    return docs.items.map((item) => item.name).join(', ')
  },
  {
    name: 'coda',
    description: 'Call to create a new page in Coda',
    schema: z.object({
      title: z.string().optional().describe('Title of the page'),
      content: z.string().optional().describe('Subtitle of the page'),
      subtitle: z
        .string()
        .optional()
        .describe('Content of the page in markdown format'),
    }),
  },
)

// Define the tools for the agent to use
const weatherTool = tool(
  async ({query}) => {
    // This is a placeholder for the actual implementation
    if (
      query.toLowerCase().includes('sf') ||
      query.toLowerCase().includes('san francisco')
    ) {
      return "It's 60 degrees and foggy."
    }
    return "It's 90 degrees and sunny."
  },
  {
    name: 'weather',
    description: 'Call to get the current weather for a location.',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  },
)

const tools = [weatherTool, codaTool]
const toolNode = new ToolNode<AgentState>(tools)

const model = new ChatAnthropic({
  model: 'claude-3-5-sonnet-20240620',
  temperature: 0,
}).bindTools(tools)

// Define the function that determines whether to continue or not
function shouldContinue(state: AgentState) {
  const messages = state.messages
  const lastMessage = messages[messages.length - 1] as AIMessage

  // If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    return 'tools'
  }
  // Otherwise, we stop (reply to the user)
  return '__end__'
}

// Define the function that calls the model
async function callModel(state: AgentState) {
  const messages = state.messages
  const response = await model.invoke(messages)

  // We return a list, because this will get added to the existing list
  return {messages: [response]}
}

// Define a new graph
const workflow = new StateGraph<AgentState>({channels: graphState})
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .addEdge('tools', 'agent')

// Initialize memory to persist state between graph runs
const checkpointer = new MemorySaver()

// Finally, we compile it!
// This compiles it into a LangChain Runnable.
// Note that we're (optionally) passing the memory when compiling the graph
const app = workflow.compile({checkpointer})

// Use the Runnable
const finalState = await app.invoke(
  // {messages: [new HumanMessage('what is the weather in sf')]},
  // {messages: [new HumanMessage('What documents do I have in Coda?')]},
  {
    messages: [
      new HumanMessage(
        'What is the weather in sf? Create a page in my coda document with the current weather report.',
      ),
    ],
  },
  {configurable: {thread_id: '42'}},
)

console.log(finalState.messages[finalState.messages.length - 1].content)
