import {AppExecutionContextDefaults, appSchemaWrapper} from '@franzzemen/app-execution-context';
import {ExecutionContextDefaults, executionSchemaWrapper} from '@franzzemen/execution-context';
import {LogExecutionContextDefaults, logSchemaWrapper} from '@franzzemen/logger-adapter';
import {CommonExecutionContextDefaults, commonOptionsSchemaWrapper} from '@franzzemen/re-common';
import {ConditionExecutionContextDefaults, conditionOptionsSchemaWrapper} from '@franzzemen/re-condition';
import {DataTypeExecutionContextDefaults, dataTypeOptionsSchemaWrapper} from '@franzzemen/re-data-type';
import {ExpressionExecutionContextDefaults, expressionOptionsSchemaWrapper} from '@franzzemen/re-expression';
import {
  LogicalConditionExecutionContextDefaults,
  logicalConditionOptionsSchemaWrapper
} from '@franzzemen/re-logical-condition';
import {RuleExecutionContextDefaults, RuleOptionOverrides, ruleOptionsSchemaWrapper} from '@franzzemen/re-rule';
import {
  ReRuleSet,
  ruleOptionOverrideSchemaWrapper,
  RuleSetExecutionContext,
  RuleSetExecutionContextDefaults,
  RuleSetOptions,
  ruleSetOptionsSchemaWrapper
} from '@franzzemen/re-rule-set';
import Validator, {ValidationError} from 'fastest-validator';
import {isPromise} from 'util/types';

export interface ApplicationOptions extends RuleSetOptions {
  ruleSetOptionOverrides?: RuleOptionOverrides[];
}


export interface ReApplication extends ReRuleSet {
  application?: ApplicationOptions;
}

export interface ApplicationExecutionContext extends RuleSetExecutionContext {
  re?: ReApplication;
}

export class ApplicationExecutionContextDefaults {
  static ApplicationOptions: ApplicationOptions = {};
  static ReApplication: ReApplication = {
    common: CommonExecutionContextDefaults.CommonOptions,
    data: DataTypeExecutionContextDefaults.DataTypeOptions,
    expression: ExpressionExecutionContextDefaults.ExpressionOptions,
    condition: ConditionExecutionContextDefaults.ConditionOptions,
    logicalCondition: LogicalConditionExecutionContextDefaults.LogicalConditionOptions,
    rule: RuleExecutionContextDefaults.RuleOptions,
    ruleset: RuleSetExecutionContextDefaults.RuleSetOptions,
    application: ApplicationExecutionContextDefaults.ApplicationOptions
  };
  static ApplicationExecutionContext: ApplicationExecutionContext = {
    execution: ExecutionContextDefaults.Execution(),
    app: AppExecutionContextDefaults.App,
    log: LogExecutionContextDefaults.Log,
    re: ApplicationExecutionContextDefaults.ReApplication
  };
}

export const applicationOptionsSchema = {
  ruleOptionOverrides: {type: 'array', optional: true, items: ruleOptionOverrideSchemaWrapper},
  ruleSetOptionOverrides: {type: 'array', optional: true, items: ruleOptionOverrideSchemaWrapper}
};

export const applicationOptionsSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ApplicationExecutionContextDefaults.ApplicationOptions,
  props: applicationOptionsSchema
};

const reApplicationSchema = {
  common: commonOptionsSchemaWrapper,
  data: dataTypeOptionsSchemaWrapper,
  expression: expressionOptionsSchemaWrapper,
  condition: conditionOptionsSchemaWrapper,
  logicalCondition: logicalConditionOptionsSchemaWrapper,
  rule: ruleOptionsSchemaWrapper,
  ruleSet: ruleSetOptionsSchemaWrapper,
  application: applicationOptionsSchemaWrapper
};

export const reApplicationSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ApplicationExecutionContextDefaults.ReApplication,
  props: reApplicationSchema
};


export const applicationExecutionContextSchema = {
  execution: executionSchemaWrapper,
  app: appSchemaWrapper,
  log: logSchemaWrapper,
  re: reApplicationSchemaWrapper
};

export const applicationExecutionContextSchemaWrapper = {
  type: 'object',
  optional: true,
  default: ApplicationExecutionContextDefaults.ApplicationExecutionContext,
  props: applicationExecutionContextSchema
};


export function isApplicationExecutionContext(options: any | ApplicationExecutionContext): options is ApplicationExecutionContext {
  return options && 're' in options; // Faster than validate
}

const check = (new Validator({useNewCustomCheckerFunction: true})).compile(applicationExecutionContextSchema);

export function validate(context: ApplicationExecutionContext): true | ValidationError[] {
  const result = check(context);
  if (isPromise(result)) {
    throw new Error('Unexpected asynchronous on ApplicationExecutionContext validation');
  } else {
    if (result === true) {
      context.validated = true;
    }
    return result;
  }
}


