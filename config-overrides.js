module.exports = function override(config, env) {
    // Add a fallback for 'stream'
    config.resolve.fallback = {
        ...config.resolve.fallback,
        "stream": false
    };
    return config
}