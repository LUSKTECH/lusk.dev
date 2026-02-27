import { fixupConfigRules } from '@eslint/compat';
import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...fixupConfigRules(coreWebVitals),
  ...fixupConfigRules(typescript),
];

export default config;
