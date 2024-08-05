import { Transition } from '@headlessui/react';
import React from 'react';

import { BotAvatar } from '@/components/Avatar';
import { Text } from '@/components/Shared';
import { useAgent } from '@/hooks/agents';
import { BotState } from '@/types/message';
import { cn } from '@/utils';
import { getCohereColor } from '@/utils/getCohereColor';
import { ConfigurableParams } from '@/stores/slices/paramsSlice';

type Props = {
  show: boolean;
  agentId?: string;
  onSend: (message?: string, overrides?: Partial<ConfigurableParams>) => void;
};

/**
 * @description Welcome message shown to the user when they first open the chat.
 */
export const Welcome: React.FC<Props> = ({ show, agentId, onSend }) => {
  const { data: agent, isLoading } = useAgent({ agentId });
  const isAgent = agentId !== undefined && !isLoading && !!agent;

  return (
    <Transition
      show={show}
      appear
      className="flex flex-col items-center gap-y-4 p-4 md:max-w-[480px] lg:max-w-[720px]"
      enter="transition-all duration-300 ease-out delay-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as="div"
    >
      {/* <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded md:h-9 md:w-9',
          isAgent && getCohereColor(agent.id),
          {
            'bg-secondary-400': !isAgent,
          }
        )}
      >
        {!isAgent ? (
          <BotAvatar state={BotState.FULFILLED} style="secondary" />
        ) : (
          <Text className="uppercase text-white" styleAs="p-lg">
            {agent.name[0]}
          </Text>
        )}
      </div> */}

      <Text
        styleAs="p-lg"
        className={cn(
          'text-center text-balance text-secondary-800 md:!text-h4 font-light',
          isAgent && getCohereColor(agent.id, { background: false })
        )}
      >
        {!isAgent ? 'What would you like to know about Project 2025?' : agent.name}
      </Text>
      <Text styleAs="p" className="text-center text-balance">
        Project 2025 is a 900&ndash;page plan for a second Trump&nbsp;Administration, written by the first Trump&nbsp;Administration.
      </Text>
      <div className="grid grid-cols-2 gap-4 mt-3 auto-rows-min w-96 text-sm">
        {[
          "How will it affect a woman's right to choose?",
          "Will this impact DACA recipients?",
          "What will happen to public education?",
          "I belong to a union. Should I be concerned?"
        ].map((q) => {
          return (
            <div className="border rounded w-full px-4 py-2 cursor-pointer" onClick={() => onSend(q)}>{q}</div>
          );
        })}
      </div>
      {/* {isAgent && (
        <Text className="!text-p-md text-center text-volcanic-900 md:!text-p-lg">
          {agent.description}
        </Text>
      )} */}
    </Transition>
  );
};
