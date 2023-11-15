import React, {useRef, useState} from "react";
import {Chat} from "./components/chat";
import {useAccessStore} from "./accessStore";
import {Box, Input} from "@chakra-ui/react";
import AuthForm from "../login/AuthForm";
import {ChatList} from "./components/chat-list";
import {useChatStore} from "./store";
import {SmallButton} from "union-ui";

const Auth = () => {
  return <Box px={3}>
    <AuthForm />
  </Box>;
}
const SidebarChat = () => {
  const accessStore = useAccessStore();
  const chatStore = useChatStore();

  return <div className={'sidebar-chat'}>
    {accessStore.isAuthorized()
      ? (
        (chatStore.currentSessionIndex !== undefined) ? <>
          <div className={'back-line'}>
            <SmallButton onClick={() => chatStore.selectSession(undefined) }>{"<"} Back</SmallButton>
          </div>
          <div className={'chat-wrapper'}>
            <Chat />
          </div>
        </> : <ChatList />
      ) : <Auth />
    }
    <style jsx>{`
      .sidebar-chat {
        height: 100%;
        position: relative;
      }
      .chat-wrapper {
        position: absolute;
        top: 30px;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .back-line {
        position: absolute;
        top: 0;
        left: 3px;
        right: 0;
        height: 30px;
        
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }
    `}</style>
  </div>
};

export default SidebarChat;
