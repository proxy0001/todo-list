import { signIn, signOut, useSession } from "next-auth/react";
import { Heading, View, Flex, Button, Text } from '@adobe/react-spectrum';

const AppHeader = () => {
  return (
    <View width="100%" padding="size-100" colorVersion={6} backgroundColor="chartreuse-200" position="fixed" left={0} top={0}>
      <Flex gap="size-100" justifyContent="space-between" alignItems="center">
        <View padding="size-50">
          <Heading level={3} margin={0}>T3 Todo List</Heading>
        </View>
        <UserInfo />
      </Flex>
    </View>
  );
};

export default AppHeader;

const UserInfo = () => {
  const { data: sessionData } = useSession();
  const onPress = sessionData ? () => void signOut() : () => void signIn();

  return (
    <Flex alignItems="center" gap="size-100">
      <Text>
        { sessionData && sessionData.user?.name }
      </Text>
      <Button
        variant="primary"
        onPress={onPress}
      >
        <Text>{sessionData ? "Sign out" : "Sign in"}</Text>
      </Button>
    </Flex>
  );
};
