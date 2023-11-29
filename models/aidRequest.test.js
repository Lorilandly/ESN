import AidRequestModel from '../models/aidRequest.js';

describe('Test aid request title check', () => {
    test('title valid', () => {
        expect(AidRequestModel.validTitle('test')).toBe(true);
    });
    test('title too short', () => {
        expect(AidRequestModel.validTitle('te')).toBe(false);
    });
    test('title too long', () => {
        expect(AidRequestModel.validTitle('012345678901234567890')).toBe(false);
    });
});
