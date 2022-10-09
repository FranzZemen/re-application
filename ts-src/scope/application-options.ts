import {_mergeRuleSetOptions, RuleSetOptions} from '@franzzemen/re-rule-set';

export interface ApplicationOptions extends RuleSetOptions {

}

export function _mergeApplicationOptions(source: ApplicationOptions, target: ApplicationOptions, mergeInto = true): ApplicationOptions {
  return _mergeRuleSetOptions(source, target, mergeInto);
}
