export interface ASTNode {
    type: string;
}

export interface EmptyExpression extends ASTNode {
    type: 'EmptyExpression';
}

export interface NumberLiteral extends ASTNode {
    type: 'NumberLiteral';
    value: number;
}

export interface StringLiteral extends ASTNode {
    type: 'StringLiteral';
    value: string;
}

export interface ValueKeyword extends ASTNode {
    type: 'ValueKeyword';
    value: boolean | null; // true, false, or null
}

export interface Identifier extends ASTNode {
    type: 'Identifier';
    name: string;
}

export interface ThisExpression extends ASTNode {
    type: 'ThisExpression';
}

export interface LinqExpression extends ASTNode {
    type: 'LinqExpression';
    collection: Expression;
    methodName: string;
    lambdaExpr: LambdaExpression;
}

export interface MemberAccessExpression extends ASTNode {
    type: 'MemberAccessExpression';
    identifier: Identifier;
    tail?: MemberAccessExpression; // for chaining member access
}












export interface UnaryExpression extends ASTNode {
    type: 'UnaryExpression';
    operator?: string;
    operand: Expression;
}

export interface BinaryExpression extends ASTNode {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface ParenthesizedExpression extends ASTNode {
    type: 'ParenthesizedExpression';
    expression: Expression;
}

// this LambdaExpression only supports single parameter
export interface LambdaExpression extends ASTNode {
    type: 'LambdaExpression';
    parameter: Expression;
    body: Expression;
}

export type Expression = EmptyExpression |NumberLiteral | StringLiteral | 
    UnaryExpression | BinaryExpression | 
    ParenthesizedExpression | LambdaExpression |
    Identifier | LinqExpression | ThisExpression | ValueKeyword |
    MemberAccessExpression ;