import { Token, TokenType } from './lexer';
import { Expression, NumberLiteral, BinaryExpression, ParenthesizedExpression } from './ast';

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
    
    private eat(tokenType: TokenType): void {
        if (this.currentToken.type === tokenType) {
            this.currentToken = this.getNextToken();
        } else {
            throw new Error(`Unexpected token: ${this.currentToken.type}, expected: ${tokenType}`);
        }
    }
    
    public parse(): Expression {
        const ast = this.expression();
        if (this.currentToken.type !== 'EOF') {
            throw new Error('Unexpected token at end of input');
        }
        return ast;
    }
    
    private expression(): Expression {
        let node = this.term();
        
        while (this.currentToken.type === 'ADDMINUS') {
            const operator = this.currentToken.value;
            this.eat(this.currentToken.type);
            
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.term()
            } as BinaryExpression;
        }
        
        return node;
    }
    
    private term(): Expression {
        let node = this.factor();
        
        while (this.currentToken.type === 'MULDIV') {
            const operator = this.currentToken.value;
            this.eat(this.currentToken.type);
            
            node = {
                type: 'BinaryExpression',
                operator,
                left: node,
                right: this.factor()
            } as BinaryExpression;
        }
        
        return node;
    }
    
    private factor(): Expression {
        if (this.currentToken.type === 'LPAREN') {
            this.eat('LPAREN');
            const expression = this.expression();
            this.eat('RPAREN');
            return {
                type: 'ParenthesizedExpression',
                expression
            } as ParenthesizedExpression;
        } else if (this.currentToken.type === 'NUMBER') {
            const value = parseInt(this.currentToken.value!, 10);
            this.eat('NUMBER');
            return {
                type: 'NumberLiteral',
                value
            } as NumberLiteral;
        } else {
            throw new Error('Unexpected token in factor');
        }
    }
}