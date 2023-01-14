import { type NextPage } from "next";
import Head from "next/head";
import { Heading } from '@adobe/react-spectrum';
import AppHeader from '../components/AppHeader';
import AppBody from '../components/AppBody';
import DemoTaskList from '../components/DemoTaskList'
const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>T3 Todo List</title>
        <meta name="description" content="A Todo List Created by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppHeader />
      <AppBody>
        <section className="w-[30rem] max-w-full flex flex-col items-center h-96 mt-10">
          <Heading level={2}>Login to start or try it here 👇</Heading>
          <DemoTaskList />
        </section>
      </AppBody>
    </>
  );
};

export default Home;
