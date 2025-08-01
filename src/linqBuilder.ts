import Enumerable from 'linq';



export class LinqBuilder {
    
    private jsonObject: any;

    private parameterExpression: string;
    private memberAccessExpression: string;
    private comparisonOperator: string;
    private numberExpression: string;

    constructor(jsonObject: any, parameterExpression: string, memberAccessExpression: string, comparisonOperator: string, numberExpression: string) {
        this.jsonObject = jsonObject;
        this.parameterExpression = parameterExpression;
        this.memberAccessExpression = memberAccessExpression;
        this.comparisonOperator = comparisonOperator;
        this.numberExpression = numberExpression;
    }

    public TryBuildAndExecuteLinqFunction(): Enumerable.IEnumerable<any> {

        const data = Enumerable.from<any>(this.jsonObject);


        if (this.memberAccessExpression.startsWith(this.parameterExpression + '.')) {
            // Remove the parameter expression from the start
            this.memberAccessExpression = this.memberAccessExpression.substring(this.parameterExpression.length + 1);
        }
        const memberAccessPaths = this.memberAccessExpression.split('.');

        // build one function
        const lambdaFunction = (element: any, index: number): boolean => {
            const memberAccessValue = this.memberAccess(element, memberAccessPaths);
            const numberValue = parseInt(this.numberExpression, 10);
            return this.comparison(memberAccessValue, numberValue, this.comparisonOperator);
        };

        // used previously built function to reduce parameters
        const whereFunction = (array: Enumerable.IEnumerable<any>): Enumerable.IEnumerable<any> => {
            return array.where(lambdaFunction);
        };
        
        
        return whereFunction(data);
    }
    // Add methods to construct LINQ expressions based on the tokens

    private memberAccess(element: any, paths: string[]): any {
            let curr = element;
            for (const p of paths) {
                curr = curr[p];
            }
            return curr;
    };

    private comparison(left: any, right: any, operator: string): boolean {
        switch (operator) {
            case '==':
                return left === right;
            case '!=':
                return left !== right;
            case '<':
                return left < right;
            case '>':
                return left > right;
            case '<=':
                return left <= right;
            case '>=':
                return left >= right;
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }
}