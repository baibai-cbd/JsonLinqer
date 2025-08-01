export type TokenType = 'NUMBER' | 'STRING' | 'IDENTIFIER' | 'VALUEKEYWORD' | 
                 'WHITESPACE' | 'OPERATOR' | 'PUNCTUATION' | 'LPAREN' |
                 'RPAREN' | 'MULDIV' | 'ADDMINUS' | 'EOF' | 'THIS' | 'DOT';

export type Token = {
    type: TokenType;
    value?: string;
}

const lexerRules: { type: TokenType; regex: RegExp }[] = [
    { type: 'WHITESPACE', regex: /^\s+/ },
    { type: 'NUMBER', regex: /^[0-9]+/ },
    { type: 'STRING', regex: /^"[^"]*"/ },
    { type: 'THIS', regex: /^this/ },
    { type: 'VALUEKEYWORD', regex: /^(true|false|null)/ },
    { type: 'IDENTIFIER', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: 'DOT', regex: /^\./ },
    { type: 'OPERATOR', regex: /^(=>|=|==|!=|<|>|<=|>=|&&|\|\||!)/ },
    { type: 'PUNCTUATION', regex: /^({|}|,|:|\[|\])/ },
    { type: 'LPAREN', regex: /^\(/ },
    { type: 'RPAREN', regex: /^\)/ },
    { type: 'MULDIV', regex: /^(\*|\/)/ },
    { type: 'ADDMINUS', regex: /^(\+|\-)/ }
];

export const lexer = (input: string): Token[] => {
    input = input.trim();
    const tokens: Token[] = [];
    let index = 0;

    while (index < input.length) {
        let match = null;

        for (const rule of lexerRules) {
            match = input.slice(index).match(rule.regex);
            if (match) {
                if (rule.type !== 'WHITESPACE') { // Ignore whitespace tokens
                    tokens.push({ type: rule.type, value: match[0] });
                }
                index += match[0].length;
                break;
            }
        }

        if (!match) {
            // If no rule matched, throw an error
            throw new Error(`lexer: unexpected token at index ${index}: ${input[index]}`);
        }
    }
    
    // Add EOF token at the end
    tokens.push({ type: 'EOF' });
    return tokens;
};