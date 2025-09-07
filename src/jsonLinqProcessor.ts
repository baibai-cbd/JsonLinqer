import { lexer } from './lexer';
import { Parser } from './parser';
import { ASTEvaluator } from './astEvaluator';

export const jsonLinqProcessor = (promptString: string, jsonObject: any): string => {
  const tokens = lexer(promptString);
  let parser = new Parser(tokens);
  let ast = parser.parse();
  //console.log('Tokens:', tokens);
  //console.log('AST:', JSON.stringify(ast, null, 2));

  let astEvaluator = new ASTEvaluator(new Map<string, any>([['this', jsonObject]]));
  const results = astEvaluator.visitLinqExpression(ast);
  
  const jsonResponse = results.toArray();
  console.log(jsonResponse);
  // let linqBuilder = new LinqBuilder(jsonObject, "x", "x.temperatureC", ">=", "10");
  // const result = linqBuilder.TryBuildAndExecuteLinqFunction();

  return JSON.stringify(results.toArray(), null, 2);
};