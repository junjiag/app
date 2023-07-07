import {
  Box,
  Button,
  Input,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Editable,
  EditablePreview,
  EditableInput,
  useEditableControls,
  ButtonGroup,
  IconButton,
  Spacer,
  HStack,
  SimpleGrid,
  Center,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import AppLayout from 'AppLayout'
import { NextPageWithLayout } from '../NextPageWithLayout'
import trpc from "../trpc";
import { CheckIcon, CloseIcon, EditIcon, EmailIcon } from '@chakra-ui/icons';
import { toast } from "react-toastify";
import useUserContext from 'useUserContext';

// Dedupe code with index.tsx:SetNameModal
const UserProfile: NextPageWithLayout = () => {
  const [user, setUser] = useUserContext();
  const [name, setName] = useState<string>('');
  const [notLoaded, setNotLoaded] = useState(false);

  useEffect(() => {
    setName(user.name || '')
  }, [user]);

  const handleSubmit = async () => {
    setNotLoaded(true);

    if (name) {
      const updatedUser = structuredClone(user);
      updatedUser.name = name;

      // TODO: Handle error display globally. Redact server-side errors.
      try {
        await trpc.users.update.mutate(updatedUser);
        toast.success("个人信息已保存")
        setUser(updatedUser);
      } catch(e) {
        toast.error((e as Error).message);
      } finally {
        setNotLoaded(false);
      }
    }
  };

  const EditableControls = () => {
    const {
      isEditing,
      getSubmitButtonProps,
      getCancelButtonProps,
      getEditButtonProps,
    } = useEditableControls()

    return isEditing ? (
      <ButtonGroup justifyContent='left' size='sm'>
        <IconButton aria-label='confirm name change button' icon={<CheckIcon />} {...getSubmitButtonProps()} />
        <IconButton aria-label='cancel name change button' icon={<CloseIcon />} {...getCancelButtonProps()} />
      </ButtonGroup>
    ) : (
      <ButtonGroup justifyContent='left' size='sm'>
        <IconButton aria-label='edit name button' size='sm' icon={<EditIcon />} {...getEditButtonProps()} />
      </ButtonGroup>
    )
  }

  const EmailField = () => {
    return (
      <FormControl>
        <SimpleGrid columns={8}>
          <Box>
            <FormLabel marginTop='2px'>邮箱</FormLabel>
          </Box>
          <Box width='300%'>
            {user.email}
          </Box>
        </SimpleGrid>
      </FormControl>
    )
  }

  const NameField = () => {
    return (
      <FormControl isInvalid={!name}>
        <SimpleGrid columns={8}>
          <Box>
            <FormLabel marginTop='5px'>中文全名</FormLabel>
          </Box>
          <Box width='200%'>
            <Editable defaultValue={user.name ? user.name : undefined}>
              <HStack>
                <Box width='200%'>
                  <EditablePreview/>
                  <Input
                    as={EditableInput}
                    backgroundColor={notLoaded ? 'brandscheme' : 'white'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isReadOnly={notLoaded}
                  />
                </Box>
                <Spacer />
                <Box>
                  <EditableControls />
                </Box>
              </HStack>
            </Editable>
          </Box>
        </SimpleGrid>
        <FormErrorMessage>用户姓名不能为空</FormErrorMessage>
      </FormControl>
    )
  }

  return (
    <Box paddingTop='80px'>
      <Stack spacing={4}>
          <EmailField />
          <NameField />
        <Button 
          onClick={handleSubmit} 
          isLoading={notLoaded}
          loadingText="保存中"
          variant='brand'
          marginBottom='24px'
        >
          保存
        </Button>
      </Stack>
    </Box>
  )
}

UserProfile.getLayout = (page) => <AppLayout>{page}</AppLayout>;

export default UserProfile;
