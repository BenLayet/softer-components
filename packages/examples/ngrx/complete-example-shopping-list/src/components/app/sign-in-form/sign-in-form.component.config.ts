import { ComponentDef } from '@softer-components/types';
import { SofterContext } from '@softer-components/app-utilities';

import { UserContextContract } from '../user-context';
import { Contract } from './sign-in-form.component.contract';
import { allEvents, uiEvents } from './sign-in-form.component.events';
import { contextsConfig } from './sign-in-form.component.forwarders';
import { selectors } from './sign-in-form.component.selectors';
import { State, initialState } from './sign-in-form.component.state';
import { stateUpdaters } from './sign-in-form.component.updaters';

const componentDef = ({
  context,
}: {
  context: SofterContext<{ userContext: UserContextContract }>;
}): ComponentDef<Contract, State> => ({
  initialState,
  selectors,
  allEvents,
  uiEvents,
  stateUpdaters,
  contextsConfig,
  contextsDef: {
    userContext: context.getRelativePath<UserContextContract>('userContext'),
  },
});

export { componentDef };
