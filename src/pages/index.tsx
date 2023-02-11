import { type NextPage } from "next"
import Head from "next/head"
import { Heading, Flex } from '@adobe/react-spectrum'
import AppHeader from '../components/AppHeader'
import AppBody from '../components/AppBody'
import { useSession } from "next-auth/react"
import useDemoTaskModel from "../hooks/useDemoTaskModel"
import { TaskManager as TaskManagerV2 } from '../components/TaskManager/TaskManager'
import { TaskManager as TaskManagerV1 } from '../components/TaskManager'

const Home: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession()
  
  const userId = sessionData && sessionData.user?.id || ''
  const modelProps = { userId }
  const demoModel = useDemoTaskModel(modelProps)
  const isLoading = sessionStatus === 'loading'
  const userName = sessionData && sessionData.user?.name || 'bff'
  const pageTitle = sessionData ?
    `Hi ${ userName }  👋` :
    'Login to start or try it here 👇'
  return (
    <>
      <Head>
        <title>T3 Todo List</title>
        <meta name="description" content="A Todo List Created by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppHeader />
      <AppBody>
        <Flex width="32rem" maxWidth="100%" margin="size-400" direction="column" alignItems="center">
          { isLoading ?
            <Flex minHeight="24rem" justifyContent="center" alignItems="center">
              <Heading level={3}>Loading...</Heading>
            </Flex> :
            <>
              <Heading level={2}>{ pageTitle } </Heading>
              {
                sessionData ?
                  <TaskManagerV2 userId={userId} /> :
                  <TaskManagerV1 model={demoModel} />
              }
            </>
          }
        </Flex>
      </AppBody>
    </>
  )
}

export default Home
