import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {RuleSetScope} from '@franzzemen/re-rule-set';
import {ApplicationOptions} from './application-options.js';
import {ApplicationParser} from '../parser/application-parser.js';

export class ApplicationScope extends RuleSetScope {
  static ApplicationParser = 'ApplicationParser';
  constructor(options?: ApplicationOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
    this.set(ApplicationScope.ApplicationParser, new ApplicationParser());
  }
}
