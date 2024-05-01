import TerserPlugin from 'terser-webpack-plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  webpack: (config, options) => {
    config.optimization.minimize = true
    config.optimization.minimizer = [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true },
        },
        extractComments: 'all',
      }),
    ]
    return config
  },
}

export default nextConfig