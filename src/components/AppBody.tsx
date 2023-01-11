import { View, Flex } from '@adobe/react-spectrum';

interface AppBodyProps {
  children?: React.ReactNode
}

const AppBody = ({ children }: AppBodyProps) => {
  return (
    <main className="min-h-screen">
      <View paddingTop="size-600" paddingX="size-100" minHeight="calc(100vh - size-600)">
        <Flex direction="column" alignItems="center">
          {children}
        </Flex>
      </View>
    </main>
  );
};

export default AppBody;