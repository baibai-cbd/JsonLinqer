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
    collection: ThisExpression | LinqExpression;
    methodName: string;
    lambdaExpr: LambdaExpression;
}

// this LambdaExpression only supports single parameter
export interface LambdaExpression extends ASTNode {
    type: 'LambdaExpression';
    parameter: Identifier;
    body: BinaryLogicalExpression; // TODO: expand to other expressions
}

export interface MemberAccessExpression extends ASTNode {
    type: 'MemberAccessExpression';
    identifier: Identifier;
    tail?: MemberAccessExpression; // for chaining member access
}






export interface UnaryCompareExpression extends ASTNode {
    type: 'UnaryCompareExpression';
    operator: string;
    operand: Expression;
}

export interface UnaryCalcExpression extends ASTNode {
    type: 'UnaryCalcExpression';
    operator: string;
    operand: Expression;
}

export interface BinaryLogicalExpression extends ASTNode {
    type: 'BinaryLogicalExpression';
    operator: '&&' | '||';
    left: BinaryLogicalExpression | MemberAccessExpression | ValueExpression | BinaryCompareExpression | UnaryCompareExpression;
    right: BinaryLogicalExpression | MemberAccessExpression | ValueExpression | BinaryCompareExpression | UnaryCompareExpression;
}

export interface BinaryCompareExpression extends ASTNode {
    type: 'BinaryCompareExpression';
    operator: '==' | '!=' | '<' | '>' | '<=' | '>=';
    left: BinaryCompareExpression | MemberAccessExpression | Identifier | ValueExpression;
    right: BinaryCompareExpression | MemberAccessExpression | Identifier | ValueExpression;
}

export interface BinaryCalcExpression extends ASTNode {
    type: 'BinaryCalcExpression';
    operator: string;
    left: Expression;
    right: Expression;
}

export interface ParenthesizedExpression extends ASTNode {
    type: 'ParenthesizedExpression';
    expression: Expression;
}

export type ValueExpression = NumberLiteral | StringLiteral | ValueKeyword;

export type Expression = 
    EmptyExpression | 
    ValueExpression |
    UnaryCompareExpression | UnaryCalcExpression |
    BinaryCompareExpression | BinaryCalcExpression | BinaryLogicalExpression |
    ParenthesizedExpression | LambdaExpression |
    Identifier | LinqExpression | ThisExpression |
    MemberAccessExpression ;