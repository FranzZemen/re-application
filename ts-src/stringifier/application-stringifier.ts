import {ExecutionContextI} from '@franzzemen/app-utility';
import {RuleSetStringifier} from '@franzzemen/re-rule-set';
import {ApplicationReference} from '../application-reference.js';
import {ApplicationScope} from '../scope/application-scope.js';
import {ApplicationHintKey} from '../util/application-hint-key.js';
import {StringifyApplicationOptions} from './stringify-application-options.js';

export class ApplicationStringifier {
  constructor() {
  }

  stringify(appRef: ApplicationReference, scope: ApplicationScope, options?: StringifyApplicationOptions, ec?: ExecutionContextI) {
    let stringified: string;
    // TODO stringify options
    if(appRef.refName.indexOf(' ') < 0) {
      stringified = `<<${ApplicationHintKey.Application} name=${appRef.refName}>>`;
    } else {
      stringified = `<<${ApplicationHintKey.Application} name="${appRef.refName}">>`;
    }
    const ruleSetStringifier = new RuleSetStringifier();
    appRef.ruleSets.forEach(ruleSet => {
      stringified += ` ${ruleSetStringifier.stringify(ruleSet, scope, options, ec)}`;
    });
    return stringified;
  }
}
