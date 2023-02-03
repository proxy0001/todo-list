// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect'
import '@testing-library/jest-dom'
/**
 * REVIEW: [Issue] Import Node Code in Front-end Testing
 * some library need it with jsdom
 * @see https://github.com/jsdom/jsdom/issues/2524
 */
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder