import { Heading, View, Flex } from '@adobe/react-spectrum';
import UserInfo from './UserInfo'

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