import {Hints} from '@franzzemen/hints';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {ParserMessages, Scope} from '@franzzemen/re-common';
import {DelegateOptions, RuleContainerParser, RuleOptionOverrides} from '@franzzemen/re-rule';
import {RuleSetParser, RuleSetReference} from '@franzzemen/re-rule-set';
import {ApplicationReference} from '../application-reference.js';
import {ReApplication} from '../scope/application-execution-context.js';
import {ApplicationScope} from '../scope/application-scope.js';
import {ApplicationHintKey} from '../util/application-hint-key.js';

export class ApplicationParser extends RuleContainerParser<ApplicationReference> {
  constructor() {
    super(ApplicationHintKey.Application, [ApplicationHintKey.RulesEngine]);
  }

  protected createScope(options?: ReApplication, parentScope?: Scope, ec?: LogExecutionContext): ApplicationScope {
    return new ApplicationScope(options, parentScope, ec);
  }

  protected createReference(refName: string, options: ReApplication): ApplicationReference {
    return {refName, options, ruleSets: []};
  }

  protected delegateParsing(ref: ApplicationReference, near: string, scope: ApplicationScope, ec?: LogExecutionContext): [string, ParserMessages] {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application-parser', 'delegateParsing');
    let remaining = near;

    // Consume the remaining text as long as rule sets are returned.
    while (remaining.length > 0) {
      const parser: RuleSetParser = new RuleSetParser();
      let ruleSetRef: RuleSetReference, parseMessages: ParserMessages;

      let delegateOptions: DelegateOptions;
      let ruleSetOverrides: RuleOptionOverrides[] = (scope?.options as ReApplication)?.['re-application']?.ruleSetOptionOverrides;
      if (ruleSetOverrides && ruleSetOverrides.length > 0) {
        delegateOptions = {overrides: ruleSetOverrides};
      }
      [remaining, ruleSetRef, parseMessages] = parser.parse(remaining, delegateOptions, scope, ec);
      if (ruleSetRef) {
        ref.ruleSets.push(ruleSetRef);
      }
      const hints = Hints.peekHints(remaining, '', ec);
      if (hints?.has(ApplicationHintKey.RulesEngine)) {
        const err = new Error(`Unexpected rules engine block near "${remaining}"`);
        log.error(err);
        throw err;
      } else if (hints?.has(ApplicationHintKey.Application)) {
        // Starting a new application
        break;
      }
    }
    return [remaining, undefined];
  }
}
