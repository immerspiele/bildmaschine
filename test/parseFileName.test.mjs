import { describe, it, expect } from 'vitest';
import parseFileName from '../lib/parseFileName.mjs';

describe('parseFileName', () => {
  it('should parse file names correctly', () => {
    expect(parseFileName('image.jpg')).toEqual({
      name: 'image',
      extension: 'jpg',
      width: null,
      height: null,
      format: null,
    });
  });
});
