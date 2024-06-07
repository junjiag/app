import {
  Text,
  Box
} from '@chakra-ui/react';
import React from 'react';
import { useUserContext } from "../UserContext";
import { isPermitted } from 'shared/Role';
import { fullPage } from 'AppPage';
import { topbarHeight } from "../components/Navbars";

export default fullPage(() => {
  const [user] = useUserContext();
  if (!isPermitted(user.roles, ["Mentee", "Mentor", "MentorCoach"])) {
    return <Text>无权查看本页。</Text>;
  }

  return (
      <Box h={`calc(100vh - ${topbarHeight})`}>
        <iframe src="https://f179b1fd0cd3453e9f34d95e95dc5f.super.site"
                width="100%" height="100%"/>
      </Box>
  );
});
