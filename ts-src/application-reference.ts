import {NamedReference} from '@franzzemen/re-common';
import {RuleSetReference} from '@franzzemen/re-rule-set';
import {Application} from './application';
import {ApplicationOptions} from './scope/application-options';

export const DefaultApplicationName = 'Default';

export function isApplicationReference(app: ApplicationReference | Application): app is ApplicationReference {
  return 'ruleSets' in app;
}

export interface ApplicationReference extends NamedReference {
  options: ApplicationOptions;
  ruleSets: RuleSetReference [];
}
