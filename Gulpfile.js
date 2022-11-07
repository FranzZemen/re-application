import {cwd} from 'node:process';
import * as gulpBase from '@franzzemen/gulp-base';
import {createRequire} from 'module';
import {join, dirname} from 'node:path';
import {npmu as npmuFunc} from '@franzzemen/npmu';
import {fileURLToPath} from 'url';

const requireModule = createRequire(import.meta.url);
gulpBase.init(requireModule('./package.json'), cwd() + '/tsconfig.src.json', cwd() + '/tsconfig.test.json', 100);
gulpBase.setMainBranch('main');

export const npmu = (cb) => {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  
  npmuFunc([
    {
      path: join(__dirname, '../gulp-base'), packageName: '@franzzemen/gulp-base'
    }, {
      path: join(__dirname, '../npmu'), packageName: '@franzzemen/npmu'
    }, {
      path: join(__dirname, '../module-factory'), packageName: '@franzzemen/module-factory'
    }, {
      path: join(__dirname, '../execution-context'), packageName: '@franzzemen/execution-context'
    }, {
      path: join(__dirname, '../app-execution-context'), packageName: '@franzzemen/app-execution-context'
    }, {
      path: join(__dirname, '../logger-adapter'), packageName: '@franzzemen/logger-adapter'
    }, {
      path: join(__dirname, '../enhanced-error'), packageName: '@franzzemen/enhanced-error'
    }, {
      path: join(__dirname, '../module-resolver'), packageName: '@franzzemen/module-resolver'
    }, {
      path: join(__dirname, '../hints'), packageName: '@franzzemen/hints'
    }, {
      path: join(__dirname, '../re-common'), packageName: '@franzzemen/re-common'
    }, {
      path: join(__dirname, '../re-data-type'), packageName: '@franzzemen/re-data-type'
    }, {
      path: join(__dirname, '../re-expression'), packageName: '@franzzemen/re-expression'
    }, {
      path: join(__dirname, '../re-condition'), packageName: '@franzzemen/re-condition'
    }, {
      path: join(__dirname, '../re-logical-condition'), packageName: '@franzzemen/re-logical-condition'
    }, {
      path: join(__dirname, '../re-rule'), packageName: '@franzzemen/re-rule'
    }, {
    path: join(__dirname, '../re-rule-set'), packageName: '@franzzemen/re-rule-set',
  }, {
    path: join(__dirname, './'), packageName: '@franzzemen/re-application',
  }])
    .then(() => {
      console.log('cb...');
      cb();
    });
};


export const test = gulpBase.test;

export const clean = gulpBase.clean;
export const buildTest = gulpBase.buildTest;
export default gulpBase.default;

export const patch = gulpBase.patch;
export const minor = gulpBase.minor;
export const major = gulpBase.major;

export const npmForceUpdateProject = gulpBase.npmForceUpdateProject;
export const npmUpdateProject = gulpBase.npmUpdateProject;
