import { BinaryExpression, Expression, NumberLiteral, ParenthesizedExpression } from "./astNodes.js";

interface ASTVisitor {
    visitNumberLiteral(node: NumberLiteral): any;
    visitBinaryExpression(node: BinaryExpression): any;
    visitParenthesizedExpression(node: ParenthesizedExpression): any;
}

class ASTEvaluator implements ASTVisitor {
    visitNumberLiteral(node: NumberLiteral): number {
        return node.value;
    }
    
    visitBinaryExpression(node: BinaryExpression): number {
        const left = this.traverse(node.left);
        const right = this.traverse(node.right);
        
        switch (node.operator) {
            case '+': return left + right;
            case '-': return left - right;
            case '*': return left * right;
            case '/': return left / right;
            default: throw new Error(`Unknown operator: ${node.operator}`);
        }
    }
    
    visitParenthesizedExpression(node: ParenthesizedExpression): any {
        return this.traverse(node.expression);
    }
    
    traverse(node: Expression): any {
        switch (node.type) {
            case 'NumberLiteral': return this.visitNumberLiteral(node);
            case 'BinaryExpression': return this.visitBinaryExpression(node);
            case 'ParenthesizedExpression': return this.visitParenthesizedExpression(node);
            default: throw new Error(`Unknown node type: ${(node as any).type}`);
        }
    }
}

export const evaluateAST = (ast: Expression, data: Map<string, any>): any => {
    const evaluator = new ASTEvaluator();
    return evaluator.traverse(ast);
};