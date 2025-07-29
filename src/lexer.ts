type TokenType = 'number' | 'string' | 'identifier' | 'keyword' | 'whitespace' | 'operator' | 'punctuation';

type Token = {
    type: TokenType;
    value: string;
}

const lexerRules: { type: TokenType; regex: RegExp }[] = [
    { type: 'whitespace', regex: /^\s+/ },
    { type: 'number', regex: /^[0-9]+/ },
    { type: 'string', regex: /^"[^"]*"/ },
    { type: 'identifier', regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: 'keyword', regex: /^(this|true|false|null)/ },
    { type: 'operator', regex: /^(=>|\+|-|\*|\/|=|==|!=|<|>|<=|>=|&&|\|\||!)/ },
    { type: 'punctuation', regex: /^({|}|,|:|\[|\]|\.|\(|\))/ }
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
                if (rule.type !== 'whitespace') { // Ignore whitespace tokens
                    tokens.push({ type: rule.type, value: match[0] });
                }
                index += match[0].length;
                break;
            }
        }

        if (!match) {
            // If no rule matched, throw an error
            throw new Error(`Unexpected token at index ${index}: ${input[index]}`);
        }
    }
    
    return tokens;
};