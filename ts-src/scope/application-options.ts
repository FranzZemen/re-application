import {_mergeRuleOptions, RuleOptionOverrides} from '@franzzemen/re-rule';
import {_mergeRuleOptionOverrides, _mergeRuleSetOptions, RuleSetOptions} from '@franzzemen/re-rule-set';

export interface ApplicationOptions extends RuleSetOptions {
  ruleSetOptionOverrides?: RuleOptionOverrides[];
}

export function _mergeApplicationOptions(target: ApplicationOptions, source: ApplicationOptions, mergeInto = false): ApplicationOptions {
  const _target: ApplicationOptions = _mergeRuleSetOptions(target, source, mergeInto);
  _target.ruleSetOptionOverrides = _mergeRuleOptionOverrides(target.ruleSetOptionOverrides, source.ruleSetOptionOverrides, _mergeRuleSetOptions, mergeInto);
  return _target;
}
