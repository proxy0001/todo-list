import { signIn, signOut, useSession } from "next-auth/react";
import { Flex, Button, Text } from '@adobe/react-spectrum';

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

export default UserInfo