import config from '@zooizooi/eslint-config';
import globals from 'globals';

export default [
    ...config.typescript,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        }
    }
];