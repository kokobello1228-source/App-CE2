import { validateAll } from './validate';

describe('content validation', () => {
  it('finds no problem in generators and banks', () => {
    expect(validateAll()).toEqual([]);
  });
});
