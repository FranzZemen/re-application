import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {Scope} from '@franzzemen/re-common';
import {RuleSetScope} from '@franzzemen/re-rule-set';
import {ApplicationParser} from '../parser/application-parser.js';
import {ReApplication} from './application-execution-context.js';

export class ApplicationScope extends RuleSetScope {
  static ApplicationParser = 'ApplicationParser';

  constructor(options?: ReApplication, parentScope?: Scope, ec?: LogExecutionContext) {
    super(options, parentScope, ec);
    this.set(ApplicationScope.ApplicationParser, new ApplicationParser());
  }

  get options(): ReApplication {
    return this._options;
  }
}
