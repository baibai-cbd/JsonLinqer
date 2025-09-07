import Enumerable from "linq";
import { BinaryCompareExpression, BinaryLogicalExpression, Expression, LambdaExpression, LinqExpression, MemberAccessExpression, NumberLiteral, ParenthesizedExpression, StringLiteral, UnaryCompareExpression, ValueExpression, ValueKeyword } from "./astNodes";

interface ASTVisitor {
    visitLinqExpression(node: Expression): any;
    visitLambdaExpression(node: Expression, contextMethod: string): any;

    visitNumberLiteral(node: NumberLiteral): number;
    visitStringLiteral(node: StringLiteral): string;
    visitValueKeyword(node: ValueKeyword): boolean | null;
}

export class ASTEvaluator implements ASTVisitor {

    private dataContext: Map<string, any> = new Map();
    private lambdaParamStack: string[] = [];

    constructor(dataContext: Map<string, any> = new Map()) {
        this.dataContext = dataContext;
    }

    visitLinqExpression(node: Expression): Enumerable.IEnumerable<any> {
        if (node.type !== 'LinqExpression') {
            throw new Error(`Expected LinqExpression, got ${node.type}`);
        }

        const collection = node.collection;
        let collectionData: Enumerable.IEnumerable<any> = Enumerable.empty();
        if (collection.type === 'LinqExpression') {
            collectionData = this.visitLinqExpression(collection);
        } else if (collection.type === 'ThisExpression') {
            collectionData = Enumerable.from<any>(this.dataContext.get('this') || []);
        }
        const methodName = node.methodName;
        const lambdaExpr = node.lambdaExpr;
        let builtFunction = this.visitLambdaExpression(lambdaExpr, methodName);
        return builtFunction(collectionData);
    }

    visitLambdaExpression(node: LambdaExpression, contextMethod: string): (array: Enumerable.IEnumerable<any>) => Enumerable.IEnumerable<any> {
        switch (contextMethod) {
            case 'Where': 
                return this.BuildWhereFunction(node);    
            default: throw new Error(`Unknown method: ${contextMethod}`);
        }
    }

    visitBinaryLogicalExpression(node: BinaryLogicalExpression): (element: any) => boolean {
        const left = node.left;
        let leftResult: (element: any) => any;
        if (left.type === 'BinaryLogicalExpression') {
            leftResult = this.visitBinaryLogicalExpression(left);
        } else if (left.type === 'BinaryCompareExpression') {
            leftResult = this.visitBinaryCompareExpression(left);
        } else if (left.type === 'UnaryCompareExpression') {
            leftResult = this.visitUnaryCompareExpression(left);
        } else if (left.type === 'MemberAccessExpression') {
            leftResult = this.visitMemberAccessExpression(left);
        } else if (left.type === 'NumberLiteral') {
            leftResult = (element: any) => this.visitNumberLiteral(left);
        } else if (left.type === 'StringLiteral') {
            leftResult = (element: any) => this.visitStringLiteral(left);
        } else if (left.type === 'ValueKeyword') {
            leftResult = (element: any) => this.visitValueKeyword(left);
        }

        const right = node.right;
        let rightResult: (element: any) => any;
        if (right.type === 'BinaryLogicalExpression') {
            rightResult = this.visitBinaryLogicalExpression(right);
        } else if (right.type === 'BinaryCompareExpression') {
            rightResult = this.visitBinaryCompareExpression(right);
        } else if (right.type === 'UnaryCompareExpression') {
            rightResult = this.visitUnaryCompareExpression(right);
        } else if (right.type === 'MemberAccessExpression') {
            rightResult = this.visitMemberAccessExpression(right);
        } else if (right.type === 'NumberLiteral') {
            rightResult = (element: any) => this.visitNumberLiteral(right);
        } else if (right.type === 'StringLiteral') {
            rightResult = (element: any) => this.visitStringLiteral(right);
        } else if (right.type === 'ValueKeyword') {
            rightResult = (element: any) => this.visitValueKeyword(right);
        }

        return (element: any) => {
            const leftVal = leftResult(element);
            const rightVal = rightResult(element);
            switch (node.operator) {
                case '&&': return leftVal && rightVal;
                case '||': return leftVal || rightVal;
                default: throw new Error(`Unknown logical operator: ${node.operator}`);
            }
        };
    }

    visitBinaryCompareExpression(node: BinaryCompareExpression): (element: any) => boolean {
        const left = node.left;
        let leftResult: (element: any) => number | string | boolean | null;
        if (left.type === 'MemberAccessExpression') {
            leftResult = this.visitMemberAccessExpression(left);
        } else if (left.type === 'NumberLiteral') {
            leftResult = (element: any) => this.visitNumberLiteral(left);
        }
        const right = node.right;
        let rightResult: (element: any) => number | string | boolean | null;
        if (right.type === 'MemberAccessExpression') {
            rightResult = this.visitMemberAccessExpression(right);
        } else if (right.type === 'NumberLiteral') {
            rightResult = (element: any) => this.visitNumberLiteral(right);
        }

        return (element: any) => this.comparison(leftResult(element), rightResult(element), node.operator);
    }

    visitUnaryCompareExpression(node: UnaryCompareExpression): (element: any) => boolean {
        if (node.operator === '!' && node.operand.type === 'MemberAccessExpression') {
            const operand = this.visitMemberAccessExpression(node.operand);
            return (element: any) => !!!operand(element);
        } else {
            throw new Error(`Unsupported unary operator: ${node.operator}`);
        }
    }

    visitMemberAccessExpression(node: MemberAccessExpression): (element: any) => any {
        const paths = this.traverseMemberAccessExpression(node);
        return (element: any) => {
            return this.memberAccess(element, paths);
        };
    }

    visitNumberLiteral(node: NumberLiteral): number {
        return node.value;
    }

    visitStringLiteral(node: StringLiteral): string {
        return node.value;
    }

    visitValueKeyword(node: ValueKeyword): boolean | null {
        return node.value;
    }

    private BuildWhereFunction(node: LambdaExpression): (array: Enumerable.IEnumerable<any>) => Enumerable.IEnumerable<any> {
        const parameter = node.parameter;
        const bodyFunction = this.visitBinaryLogicalExpression(node.body);
        const wrappedFunction = (element: any, index: number): boolean => bodyFunction(element);
        return (array: Enumerable.IEnumerable<any>): Enumerable.IEnumerable<any> => {
            return array.where(wrappedFunction);
        };
    }

    private traverseMemberAccessExpression(node: MemberAccessExpression): string[] {
        if (node.tail === undefined || node.tail.type === 'EmptyExpression') {
            return [node.identifier.name];
        } else {
            return [node.identifier.name, ...this.traverseMemberAccessExpression(node.tail)];
        }
    }

    private memberAccess(element: any, paths: string[]): any {
            let curr = element;
            if (curr === null || curr === undefined) {
                return null;
            }
            if (paths.length === 1) {
                return curr;
            }
            for (const p of paths.slice(1)) {
                curr = curr[p];
                if (curr === null || curr === undefined) {
                    return null;
                }
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
export const evaluateAST = (ast: Expression, data: Map<string, any>): any => {
    const evaluator = new ASTEvaluator();
    
};
