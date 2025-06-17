module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@components': './src/components',
                        '@screens': './src/navigation/screens',
                        '@hooks': './src/hooks',
                        '@utils': './src/utils',
                        '@services': './src/services',
                        '@assets': './src/assets',
                        '@navigation': './src/navigation',
                        '@store': './src/store',
                        '@types': './src/types',
                        '@api': './src/api'
                    },
                },
            ],
        ],
    };
};
