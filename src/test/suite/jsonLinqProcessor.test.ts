import * as assert from 'assert';
import { jsonLinqProcessor } from '../../jsonLinqProcessor';
import { testData } from './testWeather';

suite('json linq process', () => {

    test('simple where on number element', () => {
        const prompt = 'this.Where(x => x.temperatureC >= 10)';
        const result = jsonLinqProcessor(prompt, testData);
        assert.strictEqual(result, JSON.stringify(testData.filter(x => x.temperatureC >= 10), null, 2));
    });
});