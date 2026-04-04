import { describe, it, expect } from 'vitest';
import { replaceTokens, type TokenMap } from '../src/engine/tokens.js';

describe('replaceTokens', () => {
  const tokens: TokenMap = {
    PROJECT_NAME: 'my-project',
    PACKAGE_SCOPE: '@my-project',
    AUTHOR_NAME: 'TheDigitalGriot',
    YEAR: '2026',
  };

  it('replaces all tokens in a string', () => {
    const input = '{"name": "{{PACKAGE_SCOPE}}/core", "author": "{{AUTHOR_NAME}}"}';
    const result = replaceTokens(input, tokens);
    expect(result).toBe('{"name": "@my-project/core", "author": "TheDigitalGriot"}');
  });

  it('replaces multiple occurrences of the same token', () => {
    const input = '{{PROJECT_NAME}} is called {{PROJECT_NAME}}';
    const result = replaceTokens(input, tokens);
    expect(result).toBe('my-project is called my-project');
  });

  it('leaves unknown tokens untouched', () => {
    const input = '{{UNKNOWN_TOKEN}} stays';
    const result = replaceTokens(input, tokens);
    expect(result).toBe('{{UNKNOWN_TOKEN}} stays');
  });

  it('handles empty string', () => {
    const result = replaceTokens('', tokens);
    expect(result).toBe('');
  });

  it('handles string with no tokens', () => {
    const input = 'no tokens here';
    const result = replaceTokens(input, tokens);
    expect(result).toBe('no tokens here');
  });
});
