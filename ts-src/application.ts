import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {
  isPromise,
  RuleElementFactory,
  RuleElementInstanceReference,
  RuleElementModuleReference,
  Scope
} from '@franzzemen/re-common';
import {isRuleSet, RuleSet, RuleSetReference, RuleSetResult} from '@franzzemen/re-rule-set';
import {ApplicationReference, isApplicationReference} from './application-reference';
import {ApplicationParser} from './parser/application-parser';
import {ApplicationOptions} from './scope/application-options';
import {ApplicationScope} from './scope/application-scope';

export function isApplication(app: ApplicationReference | Application | string): app is Application {
  if(typeof app === 'string') {
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
  options: ApplicationOptions;

  constructor(app?: ApplicationReference | Application | string, parentScope?: Scope, ec?: ExecutionContextI) {
    super();
    if (app) {
      let theAppRef: Application | ApplicationReference;
      if (typeof app === 'string') {
        const parser = new ApplicationParser();
        [app, theAppRef] = parser.parse(app, parentScope, ec);
      } else {
        theAppRef = app;
      }
      Application.fromToInstance(this, theAppRef, parentScope, ec);
    }
  }

  to(ec?: ExecutionContextI): ApplicationReference {
    // TODO: Copy options
    const appRef: ApplicationReference = {
      refName: this.refName,
      options: this.options,
      ruleSets: []
    };
    this.getRuleSets().forEach(ruleSet => appRef.ruleSets.push(ruleSet.to(ec)));
    return appRef;
  }

  protected isC(obj: any): obj is RuleSet {
    return isRuleSet(obj);
  }


  private static from(ref: RuleSet | RuleSetReference, parentScope?: Scope, ec?: ExecutionContextI): RuleSet {
    return new RuleSet(ref, parentScope, ec);
  }


  private static fromToInstance(instance: Application, ref: Application | ApplicationReference, parentScope?: Scope, ec?: ExecutionContextI) {
    if (ref) {
      if (isApplicationReference(ref)) {
        Application.fromReference(instance, ref, parentScope, ec);
      } else {
        Application.fromCopy(instance, ref, parentScope, ec);
      }
    } else {
      throw new Error('Undefined ref');
    }
  }

  private static fromReference(instance: Application, appRef: ApplicationReference, parentScope?: Scope, ec?: ExecutionContextI) {
    if (appRef) {
      instance.refName = appRef.refName;
      // TODO: Deep copy
      instance.options = appRef.options;
      instance.scope = new ApplicationScope(instance.refName, parentScope, ec);
      appRef.ruleSets.forEach(ruleSetRef => {
        instance.addRuleSet(ruleSetRef, ec);
      });
    } else {
      throw new Error('Undefined appRef');
    }
  }

  private static fromCopy(instance: Application, copy: Application, parentScope?: Scope, ec?: ExecutionContextI) {
    if (copy) {
      instance.refName = copy.refName;
      // TODO: Deep copy options
      instance.options = copy.options;
      instance.scope = new ApplicationScope(instance.refName, parentScope, ec);
      copy.repo.forEach(elem => {
        instance.addRuleSet(elem.instanceRef.instance, ec);
      });
    } else {
      throw new Error('Undefined Application');
    }
  }

  /**
   * We want to proxy the super method in order to add functionality
   */
  register(reference: RuleElementModuleReference | RuleElementInstanceReference<RuleSet>, override?: boolean, execContext?: ExecutionContextI, ...params): RuleSet {
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
    throw new Error('Do not use this method, use getRuleSet instead')
  }

  hasRuleSet(refName: string, execContext?: ExecutionContextI): boolean {
    return super.hasRegistered(refName, execContext);
  }

  addRuleSet(ruleSet: RuleSet | RuleSetReference, ec?: ExecutionContextI) {
    if (this.repo.has(ruleSet.refName)) {
      throw new Error(`Not adding RuleSet Set to Rules Engine for duplicate refName ${ruleSet.refName}`);
    }
    let theRuleSet: RuleSet;
    if (isRuleSet(ruleSet)) {
      theRuleSet = ruleSet;
    } else {
      theRuleSet = new RuleSet(ruleSet, this.scope, ec);
    }
    super.register({refName: theRuleSet.refName, instance: theRuleSet});
  }

  getRuleSet(refName: string, execContext?: ExecutionContextI): RuleSet {
    return super.getRegistered(refName, execContext);
  }

  removeRuleSet(refName: string, execContext?: ExecutionContextI) {
    return super.unregister(refName, execContext);
  }

  getRuleSets(): RuleSet[] {
    return this.getAllInstances();
  }

  /**
   * This method executes all the rule sets & rules in this application scope
   * @param dataDomain
   * @param ec
   */
  awaitExecution(dataDomain: any, ec?: ExecutionContextI): ApplicationResult | Promise<ApplicationResult> {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application', 'awaitExecution');
    const ruleSetResults: RuleSetResult [] = [];
    const ruleSetResultPromises: Promise<RuleSetResult>[] = [];
    let hasPromises = false;
    this.repo.forEach(element => {
      const ruleSet: RuleSet = element.instanceRef.instance;
      const result = ruleSet.awaitExecution(dataDomain, ec);
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

  executeSync(dataDomain: any, ec?: ExecutionContextI): ApplicationResult {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application', 'executeSync');
    const ruleSetResults: RuleSetResult [] = [];
    this.repo.forEach(element => {
      const ruleSet: RuleSet = element.instanceRef.instance;
      const result = ruleSet.executeSync(dataDomain, ec);
      ruleSetResults.push(result);
    });
    return {
      applicationRef: this.refName,
      ruleSetResults,
      valid: ruleSetResults.every(result => result.valid === true)
    };
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

  awaitRuleSetExecution(dataDomain: any, ruleSetName: string, ec?: ExecutionContextI): RuleSetResult | Promise<RuleSetResult> {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application', 'awaitRuleSetExecution');
    const ruleSet = this.getRuleSet(ruleSetName, ec);
    if (!ruleSet) {
      const err = new Error(`No rule set named "${ruleSetName}"`);
      log.error(err);
      throw err;
    }
    return ruleSet.awaitExecution(dataDomain, ec);
  }

  executeRuleSetSync(dataDomain: any, ruleSetName: string, ec?: ExecutionContextI): RuleSetResult {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application', 'awaitRuleSetExecution');
    const ruleSet = this.getRuleSet(ruleSetName, ec);
    if (!ruleSet) {
      const err = new Error(`No rule set named "${ruleSetName}"`);
      log.error(err);
      throw err;
    }
    return ruleSet.executeSync(dataDomain, ec);
  }

  static awaitApplicationExecution(dataDomain: any, app: string | ApplicationReference | Application, parentScope?: Scope, ec?: ExecutionContextI): ApplicationResult | Promise<ApplicationResult> {
    const log = new LoggerAdapter(ec, 'rules-engine', 'application', 'awaitApplicationExecution');
    let application: Application;
    if (typeof app === 'string') {
      application = new Application(app, parentScope, ec);
    } else if (isApplication(app)) {
      application = app;
    } else {
      application = new Application(app, parentScope, ec);
    }
    return application.awaitExecution(dataDomain, ec);
  }
}
