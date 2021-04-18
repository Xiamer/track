/*
 * @Author: xiaoguang_10@qq.com
 * @LastEditors: xiaoguang_10@qq.com
 * @Date: 2021-04-08 16:42:58
 * @LastEditTime: 2021-04-18 15:49:45
 */
import baseConfig from './rollup.config.base';
import serve from 'rollup-plugin-serve';

import { name } from '../package.json';

export default {
  ...baseConfig,
  output: [
    {
      file: `dist/${name}.min.js`,
      format: 'umd',
      name,
      sourcemap: true
    },
    {
      file: `dist/${name}.es.js`,
      format: 'es',
      name,
      sourcemap: true
    }
  ],
  plugins: [
    ...baseConfig.plugins,
    serve({
      port: 8080,
      contentBase: ['']
    })
  ]
};