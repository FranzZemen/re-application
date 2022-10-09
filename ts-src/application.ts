import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {RuleElementFactory, RuleElementReference} from '@franzzemen/re-common';
import {isRuleSet, RuleSet, RuleSetResult, RuleSetScope} from '@franzzemen/re-rule-set';
import {isPromise} from 'node:util/types';
import {ApplicationReference} from './application-reference.js';
import {ApplicationParser} from './parser/application-parser.js';
import {ApplicationOptions} from './scope/application-options.js';
import {ApplicationScope} from './scope/application-scope.js';

export function isApplication(app: ApplicationReference | Application | string): app is Application {
  if (typeof app === 'string') {
    return false;
  }
  return 'scope' in app && 'addRuleSet' in app;
}

export interface ApplicationResult {
  valid: boolean;
  applicationRef: string;
  ruleSetResults: RuleSetResult[];
}

export class Application extends RuleElementFactory<RuleSet> {
  refName: string;
  scope: ApplicationScope;

  constructor(ref: ApplicationReference, thisScope: ApplicationScope, ec?: ExecutionContextI) {
    super();
    this.scope = thisScope;
    this.refName = ref.refName;
    ref.ruleSets.forEach(ruleSetRef => {
      const ruleSetScope = new RuleSetScope(this.scope.options, this.scope, ec);
      const ruleSet = new RuleSet(ruleSetRef, ruleSetScope, ec);
      this.addRuleSet(ruleSet, ec);
    });
  }

  /**
   *
   * @param dataDomain
   * @param text if options are needed they need to be provided in the appropriate options hints
   * @param options
   * @param ec
   */
  static awaitExecution(dataDomain: any, text: string, options?: ApplicationOptions, ec?: ExecutionContextI): ApplicationResult | Promise<ApplicationResult> {
    const log = new LoggerAdapter(ec, 're-application', 'application', 'awaitExecution');
    const parser = new ApplicationParser();
    let [remaining, ref, applicationScope] = parser.parse(text, undefined, ec);
    let trueOrPromise = ApplicationScope.resolve(applicationScope, ec);
    if (isPromise(trueOrPromise)) {
      return trueOrPromise
        .then(trueVale => {
          const app = new Application(ref, applicationScope, ec);
          return app.awaitEvaluation(dataDomain, ec);
        });
    } else {
      const app = new Application(ref, applicationScope, ec);
      return app.awaitEvaluation(dataDomain, ec);
    }
  }

  register(re: RuleElementReference<RuleSet>, ec?: ExecutionContextI, ...params): RuleSet {
    throw new Error('Do not use this method, use addRuleSet instead');
  }

  /**
   * We want to proxy the super method in order to add functionality
   */
  unregister(refName: string, execContext?: ExecutionContextI): boolean {
    throw new Error('Do not use this method, use removeRuleSet instead');
  }

  /**
   * We want to proxy the super method in order to add functionality
   */
  getRegistered(name: string, execContext?: ExecutionContextI): RuleSet {
    throw new Error('Do not use this method, use getRuleSet instead');
  }

  hasRuleSet(refName: string, execContext?: ExecutionContextI): boolean {
    return super.hasRegistered(refName, execContext);
  }

  addRuleSet(ruleSet: RuleSet, ec?: ExecutionContextI) {
    if (this.repo.has(ruleSet.refName)) {
      throw new Error(`Not adding RuleSet Set to Rules Engine for duplicate refName ${ruleSet.refName}`);
    }
    ruleSet.scope.reParent(this.scope,ec);
    super.register({instanceRef: {refName: ruleSet.refName, instance: ruleSet}});
  }

  getRuleSet(refName: string, execContext?: ExecutionContextI): RuleSet {
    return super.getRegistered(refName, execContext);
  }

  removeRuleSet(refName: string, ec?: ExecutionContextI) {
    const ruleSet = super.getRegistered(refName, ec);
    if(ruleSet) {
      ruleSet.scope.removeParent(ec);
      return super.unregister(refName, ec);
    }
  }

  getRuleSets(): RuleSet[] {
    return this.getAllInstances();
  }

  /**
   * This method executes all the rule sets & rules in this application scope
   * @param dataDomain
   * @param ec
   */
  awaitEvaluation(dataDomain: any, ec?: ExecutionContextI): ApplicationResult | Promise<ApplicationResult> {
    const log = new LoggerAdapter(ec, 're-application', 'application', 'awaitEvaluation');
    const ruleSetResults: RuleSetResult [] = [];
    const ruleSetResultPromises: Promise<RuleSetResult>[] = [];
    let hasPromises = false;
    this.repo.forEach(element => {
      const ruleSet: RuleSet = element.instanceRef.instance;
      const result = ruleSet.awaitEvaluation(dataDomain, ec);
      if (isPromise(result)) {
        hasPromises = true;
        ruleSetResults.push(undefined);
        ruleSetResultPromises.push(result);
      } else {
        ruleSetResults.push(result);
        ruleSetResultPromises.push(undefined);
      }
    });
    if (hasPromises) {
      return Promise.all(ruleSetResultPromises)
        .then(settledPromises => {
          settledPromises.forEach((settled, index) => {
            if (settled !== undefined) {
              ruleSetResults[index] = settled;
            }
          });
          return {
            applicationRef: this.refName,
            ruleSetResults,
            valid: ruleSetResults.every(result => result.valid === true)
          };
        });
    } else {
      return {
        applicationRef: this.refName,
        ruleSetResults,
        valid: ruleSetResults.every(result => result.valid === true)
      };
    }
  }


  findFirstRule(ruleName: string, ec?: ExecutionContextI) {
    const ruleSets = this.getRuleSets();
    for (let i = 0; i < ruleSets.length; i++) {
      const rule = ruleSets[i].getRule(ruleName, ec);
      if (rule) {
        return rule;
      }
    }
  }

  protected isC(obj: any): obj is RuleSet {
    return isRuleSet(obj);
  }
}
