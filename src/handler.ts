import * as vscode from 'vscode';
import { lexer } from './lexer';
import { Parser } from './parser';
import { testData } from './test/suite/testWeather';
import { LinqBuilder } from './linqBuilder';
import { ASTEvaluator } from './astEvaluator';
import { jsonLinqProcessor } from './jsonLinqProcessor';

// define a chat handler
export const handler: vscode.ChatRequestHandler = async (
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
) => {
  // initialize the prompt
  const BASE_PROMPT =
  'You are a helpful code tutor. Your job is to teach the user with simple descriptions and sample code of the concept. Respond with a guided overview of the concept in a series of messages. Do not give the user the answer directly, but guide them to find the answer themselves. If the user asks a non-programming question, politely decline to respond.';
  let prompt = BASE_PROMPT;

  // const tokens = lexer(request.prompt);
  // console.log(tokens);
  // let parser = new Parser(tokens);
  // let ast = parser.parse();
  // console.log(JSON.stringify(ast, null, 2));

  const prompt2 = 'this.Where(x => x.temperatureC >= 10)';
  const result = jsonLinqProcessor(prompt2, testData);

//   let linqBuilder = new LinqBuilder(testData, "x", "x.temperatureC", ">=", "10");
//   const result = linqBuilder.TryBuildAndExecuteLinqFunction();
//   const jsonResponse = result.toArray();
//   console.log(jsonResponse);

//   const jsonString = JSON.stringify(jsonResponse, null, 2);

//     // Send the formatted JSON response to the chat
//     stream.markdown(`
// \`\`\`json
// ${jsonString}
// \`\`\`
// `);

  // initialize the messages array with the prompt
  //const messages = [vscode.LanguageModelChatMessage.User(prompt)];
  if (request.references.length === 0)
  {
    stream.markdown("No references provided. Please provide JSON context to work with.");
    return;
  }
  if (request.references.length >= 1)
  {
    
    const reference = request.references[0];
    const uri = (reference.value as any).uri as vscode.Uri;
    //const fileContent = await vscode.workspace.fs.readFile(uri);


    const doc = vscode.workspace.textDocuments.find(d => d.uri.toString() === uri.toString());

    let fileContent: string;
    if (doc) {
      fileContent = doc.getText(); // Gets the current (possibly unsaved) content
    } else {
      // Fallback: read from disk if not open in editor
      const fileBytes = await vscode.workspace.fs.readFile(uri);
      fileContent = Buffer.from(fileBytes).toString('utf8');
    }
    
    console.log(fileContent.toString());
  }
  // add in the user's message
  //messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

  // send the request
  //const chatResponse = await request.model.sendRequest(messages, {}, token);
  //stream.markdown("test abc");

  // stream the response
  //   for await (const fragment of chatResponse.text) {
  //     stream.markdown(fragment);
  //   }

  return;
};

// create participant
//const linqer = vscode.chat.createChatParticipant('json-linqer-v0.1', handler);

// add icon to participant
//linqer.iconPath = vscode.Uri.joinPath(context.extensionUri, 'tutor.jpeg');
