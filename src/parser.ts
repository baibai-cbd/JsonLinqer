import { Token, TokenType } from './lexer.js';
import { Expression, NumberLiteral, BinaryExpression, ParenthesizedExpression, LinqExpression, ThisExpression, LambdaExpression, StringLiteral, ValueKeyword, Identifier, EmptyExpression, MemberAccessExpression, UnaryExpression } from './astNodes.js';

export class Parser {
    private tokens: Token[];
    private index: number = 0;
    private currentToken: Token;
    
    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.currentToken = this.getNextToken();
    }

    private getNextToken(): Token {
        if (this.index < this.tokens.length) {
            return this.tokens[this.index++];
        } else {
            return { type: 'EOF', value: '' }; // End of file token
        }
    }
    
    private consume(tokenType: TokenType, tokenValue?: string): void {
        if (this.currentToken.type === tokenType && (tokenValue === undefined || this.currentToken.value === tokenValue)) {
            this.currentToken = this.getNextToken();
        } else {
            throw new Error(`parser: unexpected token: ${this.currentToken.type}, expected: ${tokenType}`);
        }
    }
    
    public parse(): Expression {
        const ast = this.linqExpr();
        if (this.currentToken.type !== 'EOF') {
            throw new Error('parser: unexpected token at end of input');
        }
        return ast;
    }

    // linq-expr ::= collection DOT linq-method-name LPAREN lambda-expr RPAREN
    private linqExpr(): Expression {
        let collection = this.collectionExpr();
        this.consume('DOT');
        let methodName = this.linqMethodName();
        this.consume('LPAREN');
        let lambdaExpr = this.lambdaExpr();
        this.consume('RPAREN');
        return {
            type: 'LinqExpression',
            collection,
            methodName,
            lambdaExpr
        } as LinqExpression;
    }

    // collection ::= this-expr | linq-expr
    private collectionExpr(): Expression {
        if (this.currentToken.type === 'THIS') {
            this.consume('THIS');
            return { type: 'ThisExpression'} as ThisExpression;
        } else {
            return this.linqExpr();
        }
    }

    // TODO will extend this to support more LINQ methods
    // linq-method-name ::= "Where"
    private linqMethodName(): string {
        if (this.currentToken.type === 'IDENTIFIER' && this.currentToken.value === 'Where') {
            const name = this.currentToken.value!;
            this.consume('IDENTIFIER');
            return name;
        } else {
            throw new Error(`parser: expected linq method name, found: ${this.currentToken.type}`);
        }
    }

    private lambdaExpr(): Expression {
        if (this.currentToken.type === 'IDENTIFIER') {
            const paramName = this.currentToken.value!;
            this.consume('IDENTIFIER');
            this.consume('OPERATOR', '=>');
            const body = this.logicalOrExpr();
            return {
                type: 'LambdaExpression',
                parameter: { type: 'Identifier', name: paramName },
                body
            } as LambdaExpression;
        } else {
            throw new Error(`parser: expected lambda parameter, found: ${this.currentToken.type}`);
        }
    }

    // logical-or-expr ::= logical-and-expr ("||" logical-and-expr)*
    private logicalOrExpr(): Expression {
        let node = this.logicalAndExpr();
        
        while (this.currentToken.type === 'OPERATOR' && this.currentToken.value === '||') {
            const operator = this.currentToken.value;
            this.consume('OPERATOR', '||');
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.logicalAndExpr()
            } as BinaryExpression;
        }
        
        return node;
    }

    // logical-and-expr ::= comparison-expr ("&&" comparison-expr)*
    private logicalAndExpr(): Expression {
        let node = this.comparisonExpr();
        
        while (this.currentToken.type === 'OPERATOR' && this.currentToken.value === '&&') {
            const operator = this.currentToken.value;
            this.consume('OPERATOR', '&&');
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.comparisonExpr()
            } as BinaryExpression;
        }
        
        return node;
    }

    // comparison-expr ::= member-access comparison-operator value-expr
    //                       | value-expr comparison-operator member-access
    //                       | member-access
    //                       | "(" logical-or-expr ")"
    //                       | value-expr
    // TODO for this rule    | "!" member-access
    private comparisonExpr(): Expression {
        let first: Expression;
        
        if (this.currentToken.type === 'IDENTIFIER') {
            first = this.memberAccess();
            if (this.currentToken.type as string === 'OPERATOR' && ['>', '<', '>=', '<=', '==', '!='].includes(this.currentToken.value!)) {
                const operator = this.currentToken.value!;
                this.consume('OPERATOR');
                const second = this.valueExpr();
                return {
                    type: 'BinaryExpression',
                    operator,
                    left: first,
                    right: second
                } as BinaryExpression;
            } else {
                return first; // Just a member access without comparison
            }
        } else if (this.currentToken.type === 'NUMBER' || this.currentToken.type === 'STRING' || this.currentToken.type === 'VALUEKEYWORD') {
            first = this.valueExpr();
            if (this.currentToken.type as string === 'OPERATOR' && ['>', '<', '>=', '<=', '==', '!='].includes(this.currentToken.value!)) {
                const operator = this.currentToken.value!;
                this.consume('OPERATOR');
                const second = this.memberAccess();
                return {
                    type: 'BinaryExpression',
                    operator,
                    left: first,
                    right: second
                } as BinaryExpression;
            } else {
                return first; // Just a value expression without comparison
            }
        } else if (this.currentToken.type === 'LPAREN') {
            this.consume('LPAREN');
            first = this.logicalOrExpr();
            this.consume('RPAREN');
            return {
                type: 'UnaryExpression',
                operand: first
            } as UnaryExpression;
        } else {
            throw new Error(`parser: unexpected token in comparison expression: ${this.currentToken.type}`);
        }
    }

    // member-access ::= identifier-expr member-access-tail
    // member-access-tail ::= DOT identifier-expr member-access-tail | empty-expr
    private memberAccess(): Expression {
        let node = this.identifierExpr();
        const tail = this.memberAccessTail();
        if (tail.type === 'EmptyExpression') {
            return node; // No member access tail, just return the identifier
        } else {
            return {
                type: 'MemberAccessExpression',
                identifier: node,
                tail: tail as MemberAccessExpression
            } as MemberAccessExpression;
        }
    }

    private memberAccessTail(): Expression {
        if (this.currentToken.type === 'DOT') {
            this.consume('DOT');
            const identifier = this.identifierExpr();
            const tail = this.memberAccessTail();
            return {
                type: 'MemberAccessExpression',
                identifier,
                tail: tail
            } as MemberAccessExpression;
        } else {
            return { type: 'EmptyExpression' } as EmptyExpression;
        }
    }

    private valueExpr(): Expression {
        if (this.currentToken.type === 'NUMBER') {
            const value = parseFloat(this.currentToken.value!);
            this.consume('NUMBER');
            return { type: 'NumberLiteral', value } as NumberLiteral;
        } else if (this.currentToken.type === 'STRING') {
            const value = this.currentToken.value!.slice(1, -1); // Remove quotes
            this.consume('STRING');
            return { type: 'StringLiteral', value } as StringLiteral;
        } else if (this.currentToken.type === 'VALUEKEYWORD') {
            let value: boolean | null;
            switch (this.currentToken.value) {
                case 'true':
                    value = true;
                    break;
                case 'false':
                    value = false;
                    break;
                case 'null':
                    value = null;
                    break;
                default:
                    throw new Error(`parser: unexpected value keyword: ${this.currentToken.value}`);
            }
            this.consume('VALUEKEYWORD');
            return { type: 'ValueKeyword', value: value } as ValueKeyword;
        } else {
            throw new Error(`parser: unexpected token in value expression: ${this.currentToken.type}`);
        }
    }

    private identifierExpr(): Identifier {
        if (this.currentToken.type === 'IDENTIFIER') {
            const name = this.currentToken.value!;
            this.consume('IDENTIFIER');
            return { type: 'Identifier', name } as Identifier;
        } else {
            throw new Error(`parser: expected identifier, found: ${this.currentToken.type}`);
        }
    }
    
    private arithExpr(): Expression {
        let node = this.arithTerm();
        
        while (this.currentToken.type === 'ADDMINUS') {
            const operator = this.currentToken.value;
            this.consume(this.currentToken.type);
            
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.arithTerm()
            } as BinaryExpression;
        }
        
        return node;
    }
    
    private arithTerm(): Expression {
        let node = this.arithFactor();
        
        while (this.currentToken.type === 'MULDIV') {
            const operator = this.currentToken.value;
            this.consume(this.currentToken.type);
            
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.arithFactor()
            } as BinaryExpression;
        }
        
        return node;
    }
    
    private arithFactor(): Expression {
        if (this.currentToken.type === 'LPAREN') {
            this.consume('LPAREN');
            const expression = this.arithExpr();
            this.consume('RPAREN');
            return {
                type: 'ParenthesizedExpression',
                expression
            } as ParenthesizedExpression;
        } else if (this.currentToken.type === 'NUMBER') {
            const value = parseInt(this.currentToken.value!, 10);
            this.consume('NUMBER');
            return {
                type: 'NumberLiteral',
                value
            } as NumberLiteral;
        } else {
            throw new Error('parser: unexpected token in factor');
        }
    }
}