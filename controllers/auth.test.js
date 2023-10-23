import { validPassword, validUsername } from './auth.js';

describe('Test username check', () => {
    test('username valid', () => {
        expect(validUsername('lori')).toBe('lori');
    });
    test('username too short', () => {
        expect(validUsername('lo')).toBe(false);
    });
    test('username in banned list', () => {
        expect(validUsername('root')).toBe(false);
    });
    test('username in banned list 2', () => {
        expect(validUsername('javascript')).toBe(false);
    });
    test('username upper case', () => {
        expect(validUsername('UPPER')).toBe('upper');
    });
    test('username mixed cases', () => {
        expect(validUsername('MiXeD')).toBe('mixed');
    });
});

describe('Test password check', () => {
    test('password valid', () => {
        expect(validPassword('1234')).toBe('1234');
    });
    test('password too short', () => {
        expect(validPassword('123')).toBe(false);
    });
    test('password upper case', () => {
        expect(validPassword('UPPER')).toBe('UPPER');
    });
    test('password lower case', () => {
        expect(validPassword('lower')).toBe('lower');
    });
});
