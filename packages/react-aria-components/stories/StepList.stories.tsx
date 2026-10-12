/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from 'storybook/actions';
import {
  Check,
  ClipboardList,
  GitCompareArrows,
  Hammer,
  LucideIcon,
  Rocket,
  ShieldCheck
} from 'lucide-react';
import {Link} from '../src/Link';
import {Meta, StoryObj} from '@storybook/react';
import React, {ReactNode, useCallback, useMemo, useState} from 'react';
import {RouterProvider} from 'react-aria/private/utils/openLink';
import {StepList, StepListItem} from '../src/StepList';
import './StepList.global.css';
import {Text} from '../src/Text';

export default {
  title: 'React Aria Components/StepList',
  component: StepList,
  args: {
    onSelectionChange: action('onSelectionChange'),
    onLastCompletedStepChange: action('onLastCompletedStepChange')
  },
  argTypes: {
    children: {
      table: {
        disable: true
      }
    },
    isReadOnly: {
      control: 'boolean'
    },
    onLastCompletedStepChange: {
      table: {
        disable: true
      }
    },
    onSelectionChange: {
      table: {
        disable: true
      }
    },
    orientation: {
      control: {
        type: 'inline-radio',
        options: ['horizontal', 'vertical']
      }
    }
  }
} as Meta<typeof StepList>;

export type StepListStory = StoryObj<typeof StepList>;

interface ItemValue {
  id: string;
  url: string;
}
let items: Array<ItemValue> = [
  {id: 'Home', url: '/'},
  {id: 'React Aria', url: '/react-aria'},
  {id: 'StepList', url: '/react-aria/StepList'}
];

// Translate the router's selected route into the id of the matching step so it can
// drive the StepList's `selectedKey`.
function routeToId<T extends ItemValue>(list: Array<T>, route: string): string {
  return list.find(item => item.url === route)?.id ?? list[0].id;
}

// A stand-in for a client side router. RouterProvider lets every RAC Link in the tree
// navigate through it, so the steps render as real anchors with an href.
function Router(props: {
  children: ({selectedRoute}: {selectedRoute: string}) => ReactNode;
  defaultSelectedRoute: string;
}) {
  let [selectedRoute, setSelectedRoute] = useState<string>(props.defaultSelectedRoute);

  return (
    <RouterProvider navigate={setSelectedRoute}>{props.children({selectedRoute})}</RouterProvider>
  );
}

export const StepListExample: StepListStory = {
  render: (args: any) => (
    <Router defaultSelectedRoute={items[0].url}>
      {({selectedRoute}) => (
        <StepList {...args} selectedKey={routeToId(items, selectedRoute)}>
          <StepListItem id="Home" href="/">
            <Link>
              <Text>Home</Text>
            </Link>
          </StepListItem>
          <StepListItem id="React Aria" href="/react-aria">
            <Link>
              <Text>React Aria</Text>
            </Link>
          </StepListItem>
          <StepListItem id="StepList" href="/react-aria/StepList">
            <Link>
              <Text>StepList</Text>
            </Link>
          </StepListItem>
        </StepList>
      )}
    </Router>
  )
};

function InteractiveStepList(args: any) {
  const keys = useMemo(() => (args.items || []).map(o => o.id), [args.items]);
  let [stepNumber, setStepNumber] = useState(
    () => keys.indexOf(args.selectedKey || args.defaultSelectedKey) + 1
  );

  const selectedKey = useMemo(() => {
    return keys[stepNumber - 1];
  }, [keys, stepNumber]);

  const handleSelectionChange = useCallback(
    key => {
      setStepNumber(keys.indexOf(key) + 1);
      args.onSelectionChange(key);
    },
    [keys, args]
  );

  const navigate = useCallback(
    (href: string) => handleSelectionChange(routeToId(args.items, href)),
    [args.items, handleSelectionChange]
  );

  return (
    <RouterProvider navigate={navigate}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        <StepList {...args} onSelectionChange={handleSelectionChange} selectedKey={selectedKey} />
        <div>
          <button onClick={() => setStepNumber(Math.max(stepNumber - 1, 1))}>Prev</button>
          <button onClick={() => setStepNumber(Math.min(stepNumber + 1, keys.length))}>Next</button>
        </div>
      </div>
    </RouterProvider>
  );
}

export const DynamicStepListExample: StepListStory = {
  render: (args: any) => (
    <InteractiveStepList {...args} items={items}>
      {(item: ItemValue) => (
        <StepListItem id={item.id} href={item.url}>
          <Link>
            <Text>{item.id}</Text>
          </Link>
        </StepListItem>
      )}
    </InteractiveStepList>
  )
};

interface CoworkerItemValue {
  id: string;
  url: string;
  title: string;
  stage: number;
  Icon: LucideIcon;
}

let coworkerItems: Array<CoworkerItemValue> = [
  {id: 'plan', url: '/plan', title: 'Plan', stage: 1, Icon: ClipboardList},
  {id: 'build', url: '/build', title: 'Build', stage: 2, Icon: Hammer},
  {
    id: 'governance',
    url: '/governance',
    title: 'Governance review',
    stage: 3,
    Icon: GitCompareArrows
  },
  {id: 'launch', url: '/launch', title: 'Launch', stage: 4, Icon: ShieldCheck},
  {id: 'monitor', url: '/monitor', title: 'Monitor', stage: 5, Icon: Rocket}
];

export const CoworkerStepListExample: StepListStory = {
  render: (args: any) => (
    <Router defaultSelectedRoute="/governance">
      {({selectedRoute}) => {
        let currentIndex = coworkerItems.findIndex(item => item.url === selectedRoute);
        let currentItem = coworkerItems[Math.max(currentIndex, 0)];
        let prevItem = coworkerItems[Math.max(currentIndex - 1, 0)];
        let nextItem = coworkerItems[Math.min(currentIndex + 1, coworkerItems.length - 1)];
        return (
          <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <StepList
              {...args}
              items={coworkerItems}
              selectedKey={routeToId(coworkerItems, selectedRoute)}
              className="react-aria-StepList coworker-StepList">
              {(item: CoworkerItemValue) => {
                let Icon = item.Icon;
                return (
                  <StepListItem id={item.id} href={item.url}>
                    <Link>
                      <span className="coworker-StepListItem-marker" aria-hidden="true">
                        <span className="coworker-StepListItem-icon">
                          <Icon size={16} strokeWidth={2} />
                        </span>
                        <span className="coworker-StepListItem-check">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      </span>
                      <span className="coworker-StepListItem-labels">
                        <Text className="coworker-StepListItem-title">{item.title}</Text>
                        <span className="coworker-StepListItem-stage">{`Stage ${item.stage}`}</span>
                      </span>
                    </Link>
                  </StepListItem>
                );
              }}
            </StepList>
            {/* Content area driven by the current route: its contents change as the selected step changes. */}
            <div className="coworker-StepList-panel">
              <h3 className="coworker-StepList-panel-title">{currentItem.title}</h3>
              <p className="coworker-StepList-panel-body">
                {`Stage ${currentItem.stage} of ${coworkerItems.length}. This content updates based on the current route (${selectedRoute}).`}
              </p>
            </div>
            {/* Upcoming steps aren't selectable via click, so provide a different mechanism to progress. */}
            <div style={{display: 'flex', gap: '12px'}}>
              <Link href={prevItem.url}>Prev</Link>
              <Link href={nextItem.url}>Next</Link>
            </div>
          </div>
        );
      }}
    </Router>
  ),
  parameters: {
    description:
      'A StepList component for navigating through steps, based on NavigationTree with links. Follows https://www.w3.org/WAI/tutorials/forms/multi-page/#using-step-by-step-indicator mostly.'
  }
};
