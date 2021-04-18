
import alias from 'rollup-plugin-alias';
// 解析 node_modules 中的模块
import resolve from 'rollup-plugin-node-resolve';
// 转换 CJS -> ESM, 通常配合上面一个插件使用
import commonjs from 'rollup-plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import replace from 'rollup-plugin-replace';

export default {
  input: 'src/main.js',
  plugins: [
    alias({
      resolve: ['.js']
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    resolve(),
    commonjs({
      // non-CommonJS modules will be ignored, but you can also
      // specifically include/exclude files
      include: 'node_modules/**'
    }),
    babel({
      // runtimeHelpers: true,
      exclude: 'node_modules/**' // only transpile our source code
    })
  ]
}