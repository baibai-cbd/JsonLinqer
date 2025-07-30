export interface ASTNode {
    type: string;
}

export interface NumberLiteral extends ASTNode {
    type: 'NumberLiteral';
    value: number;
}

export interface BinaryExpression extends ASTNode {
    type: 'BinaryExpression';
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

export interface ParenthesizedExpression extends ASTNode {
    type: 'ParenthesizedExpression';
    expression: ASTNode;
}

export type Expression = NumberLiteral | BinaryExpression | ParenthesizedExpression;