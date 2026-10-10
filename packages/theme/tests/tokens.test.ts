import assert from 'node:assert/strict';
import test from 'node:test';
import { colors, typography } from '../src/tokens.ts';

test('Theme Palette tokens match official requirements', () => {
  assert.equal(colors.smokyBlack, '#11120D');
  assert.equal(colors.oliveDrab, '#565449');
  assert.equal(colors.bone, '#D8CFBC');
  assert.equal(colors.floralWhite, '#FFFBF4');
  assert.equal(colors.success, '#687B62');
  assert.equal(colors.warning, '#A58A54');
  assert.equal(colors.danger, '#A65D56');
  assert.equal(colors.info, '#647A86');
});

test('Typography specifies SUSE Mono font-family', () => {
  assert.ok(typography.fontFamily.includes('SUSE Mono'));
});
