import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {RuleSetScope} from '@franzzemen/re-rule-set';
import {ApplicationOptions} from './application-options.js';

export class ApplicationScope extends RuleSetScope {
  constructor(options?: ApplicationOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
  }
}
