/**
 * Template from: https://chakra-templates.dev/navigation/sidebar
 */
import React from 'react';
import { signOut } from "next-auth/react";
import { LockIcon } from '@chakra-ui/icons';
import { FiChevronRight } from 'react-icons/fi';
import { IoIosCog, IoMdCalendar } from "react-icons/io";
import { MdOutlineFace } from "react-icons/md";
import { IoStarOutline } from "react-icons/io5";

import {
  Avatar,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
  CloseButton,
  Flex,
  Icon,
  useColorModeValue,
  Link,
  Text,
  BoxProps,
  Divider,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useUserContext } from 'UserContext';
import { isPermitted } from 'shared/Role';
import { useRouter } from 'next/router';
import { trpcNext } from 'trpc';
import { Mentorship } from 'shared/Mentorship';
import {
  MdChevronRight,
  MdFace,
  MdVideocam,
  MdSupervisorAccount,
  MdMic,
  MdHome,
} from 'react-icons/md';
import Role from "../shared/Role";
import { sidebarWidth } from './Navbars';
import { breakpoint } from 'theme/metrics';
import { formatUserName } from 'shared/strings';
import { AttachmentIcon } from '@chakra-ui/icons';
import { PiFlagCheckeredFill } from 'react-icons/pi';
import { componentSpacing } from 'theme/metrics';
import colors from 'theme/colors';
import { staticUrlPrefix } from 'static';
import User, { isAcceptedMentee } from 'shared/User';

export const sidebarContentMarginTop = 10;
const sidebarItemPaddingY = 4;
const sidebarItemPaddingLeft = 8;
const bgColorModeValues = ['white', 'gray.900'];
const borderColorModeValues = ['gray.200', 'gray.700'];
const siderbarTextColor = "gray.500";

interface MainMenuItem {
  name: string,
  icon: React.ComponentType,
  iconColor?: string,
  path: string,
  regex?: RegExp,
  permission?: Role | Role[] | ((u: User) => boolean),
}

interface DropdownMenuItem {
  name: string, 
  // string url as the href attribute and function as the onClick handler.
  action: (() => void) | string,
  roles?: Role | Role[],
  icon?: React.ReactNode,
}

const managerDropdownMenuItems: DropdownMenuItem[] = [
  {
    name: '学生面试',
    action: '/interviews?type=MenteeInterview',
    roles: 'MentorshipManager',
  },
  {
    name: '导师面试',
    action: '/interviews?type=MentorInterview',
    roles: 'MentorshipManager',
  },
  {
    name: '面试官',
    action: '/interviewers',
    roles: 'MentorshipManager',
  },
  {
    name: '导师',
    action: '/mentors/manage',
    roles: 'MentorshipManager',
  },
  {
    name: '会议',
    action: '/groups',
    roles: 'GroupManager',
  },
  {
    name: '用户',
    action: '/users',
    roles: 'UserManager',
  },
];

const userDropdownMenuItems: DropdownMenuItem[] = [
  {
    name: '个人资料',
    action: '/profiles/me',
  },
  {
    name: '偏好设置',
    action: '/preferences/me',
  },
  {
    name: '谁能看到我的数据',
    action: '/who-can-see-my-data',
    icon: <LockIcon />
  },
  {
    name: '退出登录',
    action: signOut,
  },
];

const mainMenuItems: MainMenuItem[] = [
  {
    name: '首页',
    path: staticUrlPrefix,
    icon: MdHome,
    iconColor: colors.brand.b,
  },
  {
    name: '我的会议',
    path: '/',
    icon: MdVideocam,
    // match "/", "/groups/.*" but not "/groups/lab.*". "?" is a lookahead sign
    regex: /^\/$|\/groups\/(?!lab).*/,
  },
  {
    name: '资深导师页',
    path: '/coachees',
    icon: MdOutlineFace,
    regex: /^\/coachees/,
    permission: 'MentorCoach',
  },
  {
    name: '我的面试',
    path: '/interviews/mine',
    icon: MdMic,
    regex: /^\/interviews\/mine/,
    permission: 'Interviewer',
  },

  {
    name: '预约不定期导师',
    path: '/mentors',
    icon: IoMdCalendar,
    regex: /^\/mentors$/,
    permission: (me: User) => isAcceptedMentee(me.roles, me.menteeStatus, true)
      || isPermitted(me.roles, ['Mentor', 'MentorCoach']),
  },
  {
    name: '浏览一对一导师',
    path: '/mentors/matchable',
    icon: MdSupervisorAccount,
    regex: /^\/mentors\/matchable$/,
    permission: (me: User) => isAcceptedMentee(me.roles, me.menteeStatus)
      || isPermitted(me.roles, ['Mentor', 'MentorCoach']),
  },
  {
    name: '志愿者档案',
    path: '/volunteers',
    icon: IoStarOutline,
    regex: /^\/volunteers/,
    permission: 'Volunteer',
  },
  {
    name: '学生档案',
    path: '/mentees?menteeStatus=现届学子',
    icon: AttachmentIcon,
    regex: /^\/mentees/,
    permission: 'MentorshipManager',
  },
];

function mentorships2Items(mentorships: Mentorship[] | undefined): MainMenuItem[] {
  if (!mentorships) return [];

  mentorships.sort((a, b) => {
    if ((a.endedAt === null) == (b.endedAt === null)) {
      return formatUserName(a.mentee.name).localeCompare(
        formatUserName(b.mentee.name));
    } else {
      return a.endedAt === null ? -1 : 1;
    }
  });

  return mentorships.map(m => ({
    name: formatUserName(m.mentee.name),
    icon: m.endedAt === null ? MdFace : PiFlagCheckeredFill,
    path: `/mentees/${m.mentee.id}`,
    regex: new RegExp(`^\/mentees\/${m.mentee.id}`),
  }));
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const Sidebar = ({ onClose, ...rest }: SidebarProps) => {
  const [me] = useUserContext();
  const userName = formatUserName(me.name);
  // Save an API call if the user is not a mentor.
  const { data: mentorships } = isPermitted(me.roles, "Mentor") ?
    trpcNext.mentorships.listMyMentorshipsAsMentor.useQuery() : { data: undefined };
  const mentorshipItems = mentorships2Items(mentorships);
  const backgroundColor = useColorModeValue(bgColorModeValues[0], 
    bgColorModeValues[1]);
  const borderColor = useColorModeValue(borderColorModeValues[0], 
    borderColorModeValues[1]); 

  return <Box
    transition="3s ease"
    bg={backgroundColor}
    borderRight="1px"
    borderRightColor={borderColor}
    w={{ base: "full", [breakpoint]: sidebarWidth }}
    pos="fixed"
    h="full"
    // Setting pos to fixed creates a new stacking context,
    // which might cause the element to render beneath others (dropdown) menu.
    // Solved it by setting a lower ZIndex to it.
    zIndex="1"
    {...rest}
  >
    <Flex
      direction="column"
      justifyContent="space-between"
      // If there are many items in the sidebar or in a smaller screen size, 
      // we need to enable scrolling to access the items and user menu.
      overflowY="auto"
      h="full">
      <Box>
        <CloseButton
          display={{ base: 'flex', [breakpoint]: 'none' }} 
          onClick={onClose} 
          marginLeft={sidebarItemPaddingLeft - 2}
          marginY={sidebarItemPaddingY}  
        />
        <Box height={{
          base: 0,
          [breakpoint]: sidebarContentMarginTop - sidebarItemPaddingY,
        }} />

        {mainMenuItems
          .filter(item => typeof item.permission === "function" ?
            item.permission(me)
            :
            isPermitted(me.roles, item.permission)
          ).map(item => <SidebarRow
            key={item.path} item={item} onClose={onClose} 
          />)}

        <DropdownMenuIfPermitted
          title="管理功能"
          icon={<Icon as={IoIosCog} marginRight="2" />}
          menuItems={managerDropdownMenuItems}
          onClose={onClose}
        />

        {mentorshipItems?.length > 0 && <Divider marginY={2} />}
        {mentorshipItems.map(item => <SidebarRow key={item.path} item={item}
          onClose={onClose} />)}
      </Box>

      <Box>
        <DropdownMenuIfPermitted 
          title={userName} 
          icon={<Avatar size={'sm'} bg="brand.a" color="white" name={userName} 
            />}
          menuItems={userDropdownMenuItems}
          onClose={onClose}
        />
      </Box>
    </Flex>
  </Box>;
};

export default Sidebar;

function DropdownMenuIfPermitted({ title, icon, menuItems, onClose } : {
  title: string,
  icon: React.ReactNode,
  menuItems: DropdownMenuItem[],
} & SidebarProps) {
  const [user] = useUserContext();
  const backgroundColor = useColorModeValue(bgColorModeValues[0], 
    bgColorModeValues[1]);
  const borderColor = useColorModeValue(borderColorModeValues[0], 
    borderColorModeValues[1]);
  const filteredItems = menuItems.filter(item => 
    isPermitted(user.roles, item.roles));
  
  if (filteredItems.length === 0) {
    return <></>;
  }
  return <Flex paddingY={sidebarItemPaddingY}>
    <Menu placement='right-start'>
      <DropdownMenuButton title={title} icon={icon}/>
        <MenuList bg={backgroundColor} borderColor={borderColor}>
          {filteredItems.map((item, index) => {
            const isUrl = typeof item.action === 'string';
            return (
              <MenuItem 
                key={index} 
                // Only sets the link it is a url 
                {...isUrl && { as: NextLink,  href: item.action } }
                onClick={() => {
                  if (!isUrl) (item.action as Function)();
                  onClose();
                }}>
                {item.icon}{item.name}
              </MenuItem>); 
          })}
        </MenuList>
    </Menu>
  </Flex>;
}

const DropdownMenuButton = ({ title, icon } : { 
  title: string,
  icon: React.ReactNode,
}) => {
  return <MenuButton marginX={componentSpacing}  paddingLeft={componentSpacing}
    color={siderbarTextColor} fontWeight="bold" transition="all 0.3s" 
    _focus={{ boxShadow: 'none' }}>
    <HStack>{icon}<Text>{title}</Text><FiChevronRight /></HStack>
  </MenuButton>;
};

const SidebarRow = ({ item, onClose, ...rest }: {
  item: MainMenuItem,
} & SidebarProps) => {
  const router = useRouter();
  const active = item.regex && (
    item.regex.test(router.pathname) || item.regex.test(router.asPath));

  return <Link
    as={NextLink}
    href={item.path}
    color={active ? "brand.c" : siderbarTextColor}
    fontWeight="bold"
    onClick={onClose}
  >
    <Flex
      align="center"
      paddingLeft={sidebarItemPaddingLeft}
      paddingY={sidebarItemPaddingY}
      role="group"
      cursor={active ? "default" : "pointer"}
      {...rest}
    >
      <Icon as={item.icon} {...item.iconColor && { color: item.iconColor }} />
      <Text marginX={componentSpacing}>{item.name}</Text>
      <Icon
        as={MdChevronRight}
        opacity={0}
        _groupHover={active ? {} : { opacity: 100 }}
      />
    </Flex>
  </Link>;
};
