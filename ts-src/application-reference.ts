import {NamedReference} from '@franzzemen/re-common';
import {ScopedReference} from '@franzzemen/re-rule';
import {RuleSetReference} from '@franzzemen/re-rule-set';
import {Application} from './application.js';
import {ApplicationOptions} from './scope/application-options.js';

export const DefaultApplicationName = 'Default';

export function isApplicationReference(app: ApplicationReference | Application): app is ApplicationReference {
  return 'ruleSets' in app;
}

export interface ApplicationReference extends ScopedReference {
  options: ApplicationOptions;
  ruleSets: RuleSetReference [];
}
