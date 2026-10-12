/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLinkOptions} from 'react-aria/useLink';
import {DOMProps, Key, RefObject} from '@react-types/shared';
import {HTMLAttributes} from 'react';
import {SelectableItemStates} from '../selection/useSelectableItem';
import {StepListState} from 'react-stately/private/steplist/useStepListState';
import {useId} from '../utils/useId';
import {useSelectableItem} from '../selection/useSelectableItem';

export interface AriaStepListItemProps {
  key: Key;
}

export interface StepListItemAria extends SelectableItemStates {
  /** Props for the step element. */
  stepProps: HTMLAttributes<HTMLElement>;
  /** Props for the hidden element containing the step state text. */
  stepStateProps: HTMLAttributes<HTMLElement>;
  /** Props for the step link element. */
  linkProps: AriaLinkOptions & DOMProps;
}

export function useStepListItem<T>(
  props: AriaStepListItemProps,
  state: StepListState<T>,
  ref: RefObject<HTMLElement | null>
): StepListItemAria {
  const {key} = props;
  let {selectionManager: manager} = state;

  let isDisabled = !state.isSelectable(key);

  let {itemProps, ...states} = useSelectableItem({
    isDisabled,
    key,
    ref,
    selectionManager: manager
  });

  // The step state text lives in a hidden element outside the link so it isn't announced as
  // part of the list item. Labelling the link with the state element followed by the link
  // itself prepends the state to the link's content when computing its accessible name.
  let linkId = useId();
  let stateId = useId();

  return {
    stepProps: {
      ...itemProps,
      role: 'listitem',
      tabIndex: undefined
    },
    stepStateProps: {
      id: stateId,
      hidden: true
    },
    linkProps: {
      id: linkId,
      isDisabled,
      'aria-current': states.isSelected ? 'step' : undefined,
      'aria-labelledby': `${stateId} ${linkId}`
    },
    ...states
  };
}
