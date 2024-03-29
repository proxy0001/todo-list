# t3-todo-list

使用新工具們做一個 todo-list，包含[create-t3-app](https://create.t3.gg/), [tRPC](https://trpc.io/), [Prisma](https://www.prisma.io/), [NextAuth.js](https://next-auth.js.org/), [React Spectrum](https://react-spectrum.adobe.com/) 等等。


## 專案說明大綱

- [Online Demo](https://t3-todo-list.vercel.app/)
- [Source Code](https://github.com/proxy0001/todo-list)
- [Online Presentation](https://t3-todo-list-presentation.vercel.app/)

### 實作過程說明
- [總結與詳細說明](https://github.com/proxy0001/todo-list#總結)
- [添加測試的總結與詳細說明](https://github.com/proxy0001/todo-list#添加測試的總結與詳細說明)
- [重構的總結與詳細說明](https://github.com/proxy0001/todo-list#重構的總結與詳細說明)


### 開發模式
```
npm run dev
```
- Swagger UI: http://localhost:3000/api-doc
- 前台: http://localhost:3000

### 測試方式

注意執行測試之前，需要有安裝 docker，因整合測試使用 docker 在本地部署資料庫以利測試使用。

另需注意執行測試前，目前需要先手動執行以下命令，在 local 起 server，以進行測試。主要是為了前端整合測試使用: usePrismataskModel.ts，如果沒有要測試這隻，可以不用。

```
npm run server:test
```

執行所有測試，包含前後端的整合測試與單元測試，同樣需要先執行上述命令。
```
npm run test
```

執行所有測試，並統計覆蓋率
```
npm run test:coverage
```


執行伺服器端的所有測試
```
npm run test:server
```

執行前端的所有測試
```
npm run test:client
```

### 重構的總結與詳細說明
花了三天，把核心的 Model 以及對應的 Compoenent 進行重構。

主要的問題是在使用時有三個 List，會分別列出不同狀態下的任務：
- 代辦清單
- 已完成的代辦清單
- 封存的代辦清單

而當將代辦事項變成已完成時，該任務會從代辦清單移動到已完成。

原本是用一個大 Model 處理 3 個 List 的所有資料與狀態管理，並提供完成任務、取消完成任務等方法，但會遇到完成任務時，還要根據任務改變前後的狀態不同，去反推要更新哪幾個清單的顯示。

重構之後，將其改成 3 個小 Models 各自分開，提供自己的方法，並各自對應一個 TaskList Component 顯示。最後在 TaskManager 中整合使用。由TaskManager 觸發不同清單所提供的方法，並更新另一個清單的顯示。

#### 檔案結構

修改前後的檔案結構如下:

Before:
- src/components/TaskManager.tsx // 整合三個 List 的大組件
- src/components/EditTask.tsx // 編輯用的小組件
- src/hooks/usePrismaTaskModel.ts // 整合三個 List 的大 Model

After:
- src/components/TaskManager/TaskManager.tsx // 整合三個 List 的大組件
- src/components/TaskManager/TaskList.tsx // 單獨一個 List 的組件
- src/components/EditTask.tsx // 編輯用的小組件
- src/hooks/taskListModel/useTodoListModel.ts // 代辦清單 Model
- src/hooks/taskListModel/useFinishListModel.ts // 已完成的代辦清單 Model
- src/hooks/taskListModel/useArchiveListModel.ts // 封存的代辦清單 Model
- src/hooks/taskListModel/utils.ts // 共用方法
- src/hooks/taskListModel/_useTaskListModel.ts // 未完成，預計要實現一個通用的清單 Model Hook，用傳入參數的方式區分差異

#### 修改前的問題

只有一個大 Model 提供這些方法與三個 Lists
```javascript
  const taskModel: TaskModel = {
    userId,
    // 三個 List
    todoList,
    finishList,
    archiveList,
    // 更改任務狀態的方法
    createTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    deleteTask,
  }
```
更改 Task 狀態的這些方法對應的是後端的處理實作，而原本的設計是不需要知道呈現面的問題，例如執行 finishTask 的方法時，代辦清單應該要少一個任務，而已完成的代辦清單要多一個。可是這時候，Model 只知道 哪個 Task 的狀態要怎麼改變，卻不知道它原本在哪個清單，是否會移動到另一個清單的這些資訊。

這個資訊應該是要從 Controller 呼叫 Model 提供的更新清單方法才對，但另一個問題是，還需要考慮到 optimitic update 相關的實作方式。第一版快速的做法，但也是最不好的做法，是用任務的狀態改變反推要影響哪些清單。

#### 修改後的思路

一個 Model 只負責處理一個 List 的資料狀態，並對應一個 TaskList 呈現。由 TaskManager 這個組件負責控制三個 Lists 的整合。

```jsx
// src/components/TaskManager/TaskManager.tsx
const todoListModel = useTodoListModel({ userId })
const finishListModel = useFinishListModel({ userId })
const archiveListModel = useArchiveListModel({ userId })

const onTodoListFinishMutate = (updatedTask: Task) => {
  console.log('onTodoListFinishMutate')
  finishListModel.optimisticAddTask && finishListModel.optimisticAddTask(updatedTask)
}

const afterTodoListFinished = (updatedTask: Task) => {
  console.log('afterTodoListFinished')
  refetchFinishList(updatedTask)
}
  
...

<TabPanels>
  <Item key="tasklist" textValue="Task List Panel">
    <TaskList title="Today's Task"
      model={todoListModel}
      activeUnarchive={false}
      onFinishMutate={onTodoListFinishMutate}
      onArchiveMutate={onTodoListArchiveMutate}
      afterFinished={afterTodoListFinished}
      afterArchived={afterTodoListArchived}
    />
    <TaskList title="Finished" 
      model={finishListModel}
      activeUnarchive={false}
      activeCreate={false}
      onUnfinishMutate={onFinishListUnfinishMutate}
      onArchiveMutate={onFinishListArchiveMutate}
      afterUnfinished={afterFinishListUnfinished}
      afterArchived={afterFinishListArchived}
    />
  </Item>
  <Item key="archives" textValue="Archived Panel">
    <TaskList title="Archived"
      model={archiveListModel}
      activeArchive={false}
      activeCreate={false}
      onUnarchiveMutate={onArchiveListUnarchiveMutate}
      afterUnarchived={afterArchiveListUnarchived}
    />
  </Item>
</TabPanels>
```

useTodoListModel 等三隻，主要提供資料 CURD 的方法，其中最複雜的部分主要是 optimistic updates 的邏輯處理，三隻不同的地方其實只有獲取資料的條件不同而已。

另一個複雜的點在於，樂觀更新關注的是當前顯示的 List，但 CURD 的方法關注的是後端 Task 表，而不是 View 的呈現。但樂觀更新觸發的點卻是執行 CURD 的方法，也就是說，當更新任務時，如果會影響到兩個 List 的顯示處理，例如需要從 A List 移動到 B List，事情就會變得比較複雜。需要知道哪個 Update 的方法，會影響到哪兩個 List 的呈現，才有辦法進行樂觀更新。

```javascript

export const useTodoListModel: UseTaskListModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()
  const [ taskList, setTaskList ] = useState<TaskList>([])

  // the differense between useTodoListModel, useFinishListModel, useArchiveListModel
  const utilList = utils.task.todoList
  const apiList = api.task.todoList
  const filterCondition: FilterCondition = task => task.isFinished !== true && task.isArchived !== true
  
  // fetch data
  const { data: newTaskList, refetch, isLoading, isError } = apiList.useQuery({ userId })
  useLayoutEffect(() => {
    setTaskList(newTaskList || [] as TaskList)
  }, [newTaskList])

  // generate all mutations
  const createMutation = genMutation<CreateMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.create,
    updater: createUpdater,
  })
  const deleteMutation = genMutation<DeleteMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.delete,
    updater: deleteUpdater
  })
  const pushMutation = genMutation<PushMutation>({
    userId,
    utilList: utilList,
    apiMethod: api.task.push,
    updater: pushUpdater(filterCondition)
  })

  // methods
  const createTask: ListModel['createTask'] = (noHeadTask, options = {}) => {
    createMutation.mutate(noHeadTask, {
      onSuccess: (data, variables, context) => {
        options.onSuccess && options.onSuccess(data)
      },
      onError: (error, variables, context) => {
        options.onError && options.onError(error.message)
      },
    })
    options.onMutate && options.onMutate(noHeadTask)
  }

  const deleteTask: ListModel['deleteTask'] = (task, options = {}) => {
    deleteMutation.mutate(task, {
      onSuccess: (data, variables, context) => {
        options.onSuccess && options.onSuccess(data)
      },
      onError: (error, variables, context) => {
        options.onError && options.onError(error.message)
      },
    })
    options.onMutate && options.onMutate(task)
  }

  const pushTask: ListModel['pushTask'] = (updatedTask, options = {}) => {
    const isExist = taskList.some(task => task.id === updatedTask.id)
    const { id, ...noHeadTask } = updatedTask
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(noHeadTask, options as CreateMethodOption),
          () => pushMutation.mutate(updatedTask, {
            onSuccess: (data, variables, context) => {
              options.onSuccess && options.onSuccess(data)
            },
            onError: (error, variables, context) => {
              options.onError && options.onError(error.message)
            },
          })
        ),
      ),
    )
    options.onMutate && options.onMutate(updatedTask)
  }

  const finishTask: ListModel['finishTask'] = (task, options = {}) => {
    pushTask({ ...task, isFinished: true }, options)
  }

  const unfinishTask: ListModel['unfinishTask'] = (task, options = {}) => {
    pushTask({ ...task, isFinished: false }, options)
  }  

  const archiveTask: ListModel['archiveTask'] = (task, options = {}) => {
    pushTask({ ...task, isArchived: true }, options)
  }

  const unarchiveTask: ListModel['unarchiveTask'] = (task, options = {}) => {
    pushTask({ ...task, isArchived: false }, options)
  }

  const refetchList: ListModel['refetchList'] = (options) => {
    const run = async () => {
      await utilList.cancel()
      return await refetch()
    }
    run().then(({ data }) => {
      options && options.onSuccess && options.onSuccess(data || [])
    }).catch((error) => {
      const message = 'refetch unknown error'
      options && options.onError && options.onError(message)
    })
  }

  const optimisticAddTask: ListModel['optimisticAddTask'] = (task) => {
    const newTaskList = [task, ...taskList].sort((a, b) => a.id < b.id ? 1 : -1)
    setTaskList(newTaskList)
  }

  return {
    userId,
    taskList,
    isLoading,
    isError,
    createTask,
    deleteTask,
    pushTask,
    finishTask,
    unfinishTask,
    archiveTask,
    unarchiveTask,
    refetchList,
    optimisticAddTask,
  }
}

```

實際上三隻 Model 的 Code 都長的一模一樣，差別只有這三行。

```javascript
// the differense between useTodoListModel, useFinishListModel, useArchiveListModel
const utilList = utils.task.todoList
const apiList = api.task.todoList
const filterCondition: FilterCondition = task => task.isFinished !== true && task.isArchived !== true
```


另一個版本的 Code 在 _useTaskListModel.ts 這隻裡面，原本是將三支共用的地方都抽小 Functions 出來簡化，但抽到最後發現，其實差別就只有上面三行，因此考慮整併成一隻還是比較合理的。但目前還遇到一些 TypeScript 的問題。

#### optimistic updates 的相關問題

做 optimistic updates 的關係，有幾個延伸問題：
1. create 如果做樂觀更新，在後端 API 回傳之前，會有一段時間不知道該 Task 的 id，如果這時候使用者對該任務做互動，會產生問題。
2. react-query 的 onMutate，需要事先定義好，不能夠在事件發生之後，再傳入要執行的動作。目前的實作方式導致 Task 從 A List 移動到 B List 時，反而會先樂觀更新 B List ，再樂觀更新 A List，使用體驗上會閃一下。
3. 進行樂觀更新之後，會 refetch 後端資料一次，如果快速進行前述動作數次，當 第一次的 refetch 後端資料回來之後，畫面顯示上可能已經是第二次的樂觀更新了。導致畫面會有閃爍，先變成第二次更新的狀態，再回到第一次的狀態，再變成第二次的狀態。
4. 樂觀更新之後，有時候會產生 id 重複的問題。

#### Review

- 花的時間大多都是在 Type 的問題上，抽共用時，需要調用整合後的 tRPC 產生 APIs，有時候不太好獲取型別的定義。
- 原本重構的目的便是後續維護更容易，其中也包含是否能夠更容易地處理 optimistic updates 的問題。目前是邏輯跟結構更為清晰單純，處理上述問題有變得容易，但還沒有到方便處理的程度。
- 將思緒寫清楚之後，發現好像又可以再重構一次。主要的癥結點是我們有三個不同的 View 跟針對同一張表的 CURD 方法要管理。或許用這樣的結構思緒會更適合：
  - taskModel: 提供整合後的方法
    - todoListModel: 負責管理前端呈現的 todo list
    - finishListModel: 負責管理前端呈現的 finish list
    - archiveListModel: 負責管理前端呈現的 archive list
    - taskTableModel: 負責提供 CURD 後端 Task 資料表的方法

taskModel 提供的整合方法，以 finishTask 來說，會需要做這幾件事：
1. 將 todo 變成 finished 之後
2. 進行 todoList 跟 finishList 的樂觀更新
3. 進行後端 Task 資料表的更新
4. 進行 todoList 跟 finishList 的 refetch data，確保前後端資料的同步。
    

### 添加測試的總結與詳細說明

花了三天多的時間，目前前後端共有這幾隻測試項目。
- 後端
  - src/server/api/routers/task.unit.test.ts
  - src/server/api/routers/task.integration.test.ts
- 前端
  - src/hooks/useDemoTaskModel.unit.test.ts
  - src/hooks/usePrismaTaskModel.integration.test.ts
- 測試環境相關的配置檔案
  - jest.config.ts
  - jest.setup.ts
  - package.json
  - docker-compose.yaml

後端主要針對 APIs 進行測試，單元測試使用 Mock Prisma 的方式進行，主要針對 API Functions 的邏輯進行測試。整合測試使用 Docker 在本地部署測試資料庫，針對 API Functions 進行測試。

前端主要針對跟處理資料的 hooks 進行測試，其中最重要的是 usePrismaTaskModel 這隻。目前對其提供的各個 Functions 進行整合測試，會起 server 在 local，讓 Hook 內部真實打 API 去資料庫獲取資料回傳。另一隻 useDemoTaskModel 只進行單元測試，因其沒有依賴外部 API。

usePrismaTaskModel 如果要進行單元測試，目前的想法是用 Mock API 的方式進行，但現階段還不清楚該如何 Mock tRPC 所產生的 APIs。

#### 測試環境準備
用 docker 部署測試資料庫，使用 .env.test 設置測試時要用的資料庫。其中因為整合測試會打同一個測試資料庫，因此執行測試時不能夠同時進行：使用 jest --runInBand 改成依序進行。

因目前要測試時還要手動起 server，後續考慮使用 [npm-call-all](https://github.com/mysticatea/npm-run-all)，看看能不能避免手動起 server 的這個步驟，讓 CI/CD 能自動執行。

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "test:setup": "npm run docker:up && npx dotenv -e .env.test prisma migrate deploy",
    "server:test": "npm run test:setup && dotenv -e .env.test -- next dev -p 3005",
    "test": "npm run test:setup && npx dotenv -e .env.test -- jest --runInBand --watch",
    "test:server": "npm run test:setup && npx dotenv -e .env.test -- jest --selectProjects server:unit server:integration --runInBand --watch",
    "test:client": "npm run test:setup && npx dotenv -e .env.test -- jest --selectProjects client --runInBand --watch",
    "test:coverage": "npm run test:setup && npx dotenv -e .env.test -- jest --runInBand --watchAll --coverage",
  }
}
```

#### Jest 測試環境建置

使用 Jest，利用 projects 的設定將前後端的測試環境分開設置。其中最麻煩的是 usePrismaTaskModel，為了要讓 tRPC Client 端能順利運作，目前引入了許多 jsdom 環境不支援的實作與相依套件（許多原本是預設在 Node 環境下執行的），因此在設置部分吃了許多苦頭。

另外有考慮改用 [Vitest](https://vitest.dev/) 試試，因其自帶 ESM 開箱即用，並且據說效能較好？ 或許可以改善許多這次環境建置所遇到的問題，例如在 jsdom 環境中，需要引入 ESM 套件等類似問題，但不知道會不會有其他延伸狀況。

參考資料:
- https://nextjs.org/docs/testing#setting-up-jest-with-the-rust-compiler
- https://www.youtube.com/watch?v=YRGo1H-qNQs

```ts
// jest.config.ts
const config: Config = {
  coverageProvider: "v8",
  projects: [
    {
      ...commonConfig,
      displayName: 'server:unit',
      rootDir: "<rootDir>/src/server",
      testEnvironment: "node",
      testMatch: [ "**/__tests__/**/*.unit.[jt]s?(x)", "**/?(*.unit.)+(spec|test).[jt]s?(x)" ]
    },
    {
      ...commonConfig,
      displayName: 'server:integration',
      rootDir: "<rootDir>/src/server",
      testEnvironment: "node",
      testMatch: [ "**/__tests__/**/*.integration.[jt]s?(x)", "**/?(*.integration.)+(spec|test).[jt]s?(x)" ]
    },
    {
      ...commonConfig,
      displayName: 'client',
      rootDir: "<rootDir>",
      testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/src/server/"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
      moduleDirectories: ["node_modules", "<rootDir>/"],
      testEnvironment: "jest-environment-jsdom",
      transform: {
        '^.+\\.(mjs|js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'], "plugins": ["@babel/plugin-proposal-private-methods"] }],
      },
      transformIgnorePatterns: [],
    }
  ],
};
```

#### 後端 API 單元測試

主要需要研究如何手動產生 tRPC 的 API caller 以及對 Prisma 進行 Mock。

參考資源:
- https://create.t3.gg/en/usage/trpc/#sample-integration-test
- https://www.youtube.com/watch?v=YRGo1H-qNQs
- https://github.com/ResoluteError/jest-tRPC-example


```javascript
// src/utils/testUtils.ts
export const setupCallerWithMockPrisma: SetupCallerWithMockPrisma = mockPrismaResponse => {
  const mockPrisma = mockDeep<PrismaClient>()
  const mockSession = createMockSession()
  const mockCtx = {
    session: mockSession,
    prisma: mockPrismaResponse(mockPrisma)
  }
  return {
    caller: appRouter.createCaller(mockCtx),
    ...mockCtx,
  }
}

// src/server/api/routers/task.unit.test.ts
describe('test task APIs with mock Prisma', () => {
  it('should return all todos of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['todoList']>
    const input: Input = {
      userId: mockData.userId
    }
    
    const mockOutput = mockData.todoList
    const { caller, prisma } = setupCallerWithMockPrisma(mockPrisma => {
      mockPrisma.task.findMany.mockResolvedValue(mockOutput)
      return mockPrisma
    })

    const result = await caller.task.todoList(input)
    expect(prisma.task.findMany).toHaveBeenCalled()
    expect(result).toHaveLength(mockOutput.length)
    expect(result).toStrictEqual(mockOutput)
  })
})
```

#### 後端 API 整合測試
結合上述作法但使用真實資料庫進行測試，測試資料庫需要另外事先準備。

參考資料
- https://www.prisma.io/docs/guides/testing/integration-testing

```javascript
// src/server/api/routers/task.integration.test.ts

beforeAll(async () => {
  await prisma.user.create({
    data: mockData.userData
  })
  await prisma.task.createMany({
    data: mockData.taskData
  })
})

afterAll(async () => {
  await prisma.$transaction([
    prisma.task.deleteMany(),
    prisma.user.deleteMany(),
  ])

  await prisma.$disconnect()
})

describe('test task APIs with real db', () => {
  const caller = setupCaller()

  it('should return all todos of the user', async () => {
    type Input = inferProcedureInput<AppRouter['task']['todoList']>
    const input: Input = {
      userId: mockData.userId
    }
    const result = await caller.task.todoList(input)
    expect(result).toHaveLength(mockData.todoList.length)
    expect(result).toMatchObject(mockData.todoList)
  })
})

```

#### 前端 Hook 單元測試
TODO: usePrismaTaskModel 如果要進行單元測試，目前的想法是用 Mock API 的方式進行，但現階段還不清楚該如何 Mock tRPC & useQuery/useMutate Response。

#### 前端 Hook 整合測試
最主要就是測 usePrismaTaskModel 這隻。其中測試環境的建置花了好多時間研究該如何做，有好幾個問題要處理：
1. 如何 Mock Next Auth 以及 Mock Session
2. 如何讓 tRPC Client 可以正常運作？
  1. Mock 相關的 Providers
3. 為了解決上述問題，引入了許多基於 Node 而非基於 jsdom 的測試環境的套件，導致各種相容性問題要處理。

參考資料:
- https://github.com/trpc/trpc/discussions/3612
- https://github.com/briangwaltney/t3-testing-example
- https://github.com/nextauthjs/next-auth/issues/4866

```javascript
// src/utils/testWrapper.tsx
...
export const hookWrapper = (user?: User) =>
  function wrapperOptions(props: { children: React.ReactNode }) {
    const session = user ? createSession(user) : undefined
    return <AllTheProviders {...props} session={ session } />
  };


// src/hooks/usePrismaTaskModel.integration.test.ts
describe('create task', () => {
    it('should add a new task in todo list', async () => {
      const { result } = setup()
      const originLength = result.current.todoList.length

      result.current.createTask(mockData.newTodoTask)
            
      await waitFor(() => {
        expect(result.current.todoList.length).toBe(originLength + 1)
        const newTask = {
          ...mockData.newTodoTask,
          id: result.current.todoList[0]?.id
        }
        expect(result.current.todoList).toContainEqual(newTask)
      })
  })
})
```

#### Review

還可以做哪些測試
- usePrismaTaskModel 的 單元測試（要如何 Mock tRPC & useQuery/useMutate Response ?）
- 增加前端 component 的單元測試/功能測試
- 前端 e2e 測試，使用 [playwright](https://playwright.dev/)
- 目前都只有寫 Happy Test，應該要包含錯誤情境與邊界情況等測試項目

可以繼續優化的地方
- 在 Vercel or Github 的 CI/CD 流程增加測試流程，使其能自動化執行。
- 避免手動起 server for 整合測試，讓 CI 可以自動執行測試。(看 [npm-run-all](https://github.com/mysticatea/npm-run-all) 能不能解決)
- coverage 的計算，可以濾掉一些沒有要做測試的地方，讓最後的涵蓋率更為精準。
- .env.test 的環境變數感覺可以在 jest.config 裡面引入，不需要從 command 上導入。
- 使用 [Vitest](https://vitest.dev/) 看配置與效能方面，會不會比 Jest 好。
- usePrismaTaskModel 的整合測試，目前測試項目之間會共享資料跟狀態，不應該這樣子做。目前知道可以使用 beforeEach 跟 afterEach 重置資料庫的資料，但還不知道該如何重置 Hook 的狀態？目前 hook 內部的 state 會受到上一個測試項目的影響。
- usePrismaTask 的實作有幾個問題存在，導致目前測試有時候會失敗，需要對其 Refactor。


遇到的問題
- create-t3-app 目前沒有比較好的建議測試方式，相關的資料也偏少，導致我們在建置測試環境上遇到許多的問題，花費的時間比想像中多非常多，且這還是在有找到一些相關討論的情況下，如果沒有，依目前的理解，可能會完全不知道該如何處理。



### 總結
耗時 8 天，細節太多沒有記錄到，總結一下在此。

實現這些功能
- 首頁 無須登入就可以嘗試使用 Todo List，藉此展示功能。
- 使用 Discord 登入，有自己的 Todo List 可以使用，持久儲存。

這次用 [create-t3-app](https://create.t3.gg/) 來建置環境，基本上算全端了，基底是 [Next.js](https://nextjs.org/)，使用 [Prisma](https://www.prisma.io/) 作為 ORM，使用 [tRPC](https://trpc.io/)，可以保證前後端類型安全，基本上後端 API 就是基於它實作，default 搭配 [Zod](https://github.com/colinhacks/zod) 做型別驗證。然後用 [trpc-openapi](https://github.com/jlalmes/trpc-openapi) 這個插件協助轉成 OpenAPI Spec，再用 [swagger-ui-react](https://github.com/swagger-api/swagger-ui) 作為後台 API 介面。 UI Library 選用 Adobe 出的 [React-Spectrum](https://react-spectrum.adobe.com/react-spectrum/index.html)，邏輯實現有使用到 [fp-ts](https://gcanti.github.io/fp-ts/)，登入使用 [NextAuth](https://next-auth.js.org/)。以上用到的工具除了 Next.js 都是第一次使用。

另外 DB 使用 PostgreSQL，部署在 [Railway](https://railway.app/)，App 部署在 [Vercel](https://vercel.com)

### 詳細說明

#### 專案結構 說明

```
.
├── prisma
│   ├── migrations // DB migrations
│   └── schema.prisma // DB Schema
├── src
│   ├── components // 前端視覺組件
│   │   └── TaskManager.tsx // 包含 Todo List 所有功能的大組件
│   ├── hooks
│   │   ├── useDemoTaskModel.ts // 展示用的資料狀態管理
│   │   └── usePrismaTaskModel.ts // 接 DB 用的資料狀態管理
│   ├── pages
│   │   ├── api // 所有自動產生的 API 接口實現
│   │   │   └── openapi.json.ts // openAPI Doc File
│   │   ├── api-doc.tsx // swagger UI
│   │   └── index.tsx // 前端首頁
│   ├── server
│   │   ├── api
│   │   │   ├── routers // 後端 API 接口定義處
│   │   │   │   └── task.ts // API 實現
│   ├── types
│   │   └── task.ts // Shared Mental Model 定義

```

#### 環境建置
[create-t3-app](https://create.t3.gg/) 就可以很容易地配置好基礎環境，否則要整合那些工具還是很費工的，[Next.js](https://nextjs.org/) 跟 [TypeScript](https://www.typescriptlang.org/)，以及一些 Lint 跟 Prettier 等等，是基本配備，另外可以選用 [Prisma](https://www.prisma.io/)、[Tailwind](https://tailwindcss.com/)、[tRPC](https://trpc.io/)、[NextAuth](https://next-auth.js.org/)。這次全部都選用。

#### Domain-Driven Design

原本是用 TS 進行 Shared Mental Model 的塑造，但後來發現 API 的部分需要使用 [Zod](https://github.com/colinhacks/zod) 定義以便驗證，因此後來就改用 [Zod](https://github.com/colinhacks/zod) 的方式定義，再轉成 Type。

這裡有個問題是，它轉出來的 Type 比較醜，閱讀起來很累，另外其實原本是希望用 TypeScript 寫，再轉成 Zod，這個問題好像有看到解決方案，但還沒處理。另一種思路是用 Primsa 根據 Schema 自動產出的 Type 為基礎。

```typescript
// src/types/task.ts

import { z } from "zod"

...
export const task = z.object({
  id: z.number(),
  userId,
  title: z.string(),
  isFinished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})
export type Task = z.infer<typeof task>

...

export const taskModel = z.object({
  userId,
  todoList: taskList,
  finishList: taskList,
  archiveList: taskList,
  createTask: z.function().args(task).returns(z.void()),
  pushTask: z.function().args(task).returns(z.void()),
  finishTask: z.function().args(task).returns(z.void()),
  unfinishTask: z.function().args(task).returns(z.void()),
  archiveTask: z.function().args(task).returns(z.void()),
  unarchiveTask: z.function().args(task).returns(z.void()),
  deleteTask: z.function().args(task).returns(z.void()),
})
export type TaskModel = z.infer<typeof taskModel>

export const taskSchema = {
  userId,
  task,
  noHeadTask,
  todo,
  finish,
  archive,
  todoList: taskList,
  finishList: taskList,
  archiveList: taskList,
  taskModel,
}
export default taskSchema
```


#### 登入驗證

[create-t3-app](https://create.t3.gg/) 已經把相關邏輯跟實作都內建了，剩下的只要照著[說明](https://create.t3.gg/en/usage/first-steps)做一些配置就可以實現 Discord 登入登出了，其他的要再看 NextAuth 的說明。DB Schema 是 使用 NextAuth 針對 Prisma 的 [Adapter](https://next-auth.js.org/adapters/prisma)。

#### 資料庫相關實作

基本上就是使用 [Prisma](https://www.prisma.io/)。寫起來像這樣：

```prisma
// prisma/schema.prisma

model User {
    id            String    @id @default(cuid())
    name          String?
    email         String?   @unique
    emailVerified DateTime?
    image         String?
    accounts      Account[]
    sessions      Session[]
    tasks         Task[]
}

model Task {
    id         Int       @id @default(autoincrement())
    userId     String
    createdAt  DateTime  @default(now())
    updatedAt  DateTime  @updatedAt
    title      String    @db.Text
    isFinished Boolean   @default(false)
    isArchived Boolean   @default(false)
    user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

```

Schema 寫好之後，儲存，使用它的 Cli，就可以自動產生 migrations，檔案並且執行。檔案會放在 prisma/migrations/ 底下。

```
npx prisma migrate dev --name init
```

接著就可以使用 [PrismaClient](https://www.prisma.io/docs/getting-started/quickstart#4-explore-how-to-send-queries-to-your-database-with-prisma-client) 對資料庫進行操作了。 create-t3-app 對相關工具進行了整合，所以在 Code 裡面不需要自行調用 PrismaClient，可以直接從 context 裡面獲取。

### Backend API 實作

使用 create-t3-app 所配置好的方式實作，就可以直接搭配 [tRPC](https://trpc.io/) 使用。使用 [tRPC](https://trpc.io/) 的好處是什麼？就是直接可以吃到資料庫 Schema 所定義的型別，在開發過程中，就可以看到提示跟類型錯誤的警示。並且會搭配使用 [Zod](https://github.com/colinhacks/zod) 在 runtime 時進行驗證以確保資料型別的正確性。另外自行配置 [trpc-openapi](https://github.com/jlalmes/trpc-openapi) 插件，就可以自動產出符合 OpenAPI Spec 的 Document。然後可以用 [swagger-ui-react](https://github.com/swagger-api/swagger-ui) 架後台畫面出來。 Swagger UI: http://localhost:3000/api-doc

範例如下：
```typescript
// src/server/api/routers/task.ts
export const taskRouter = createTRPCRouter({
  todoList: protectedProcedure
    .meta({ openapi: {
      method: 'GET',
      path: '/todoList',
      tags: ['task'],
      summary: 'Read all tasks of the user.',
    }})
    .input(taskSchema.task.pick({ userId: true }))
    .output(taskSchema.todoList)
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.task.findMany({
        where: {
          userId: input.userId,
          isFinished: false,
          isArchived: false,
        },
        orderBy: {
          id: 'desc'
        }
      })
    }),
  create: protectedProcedure
    .meta({ openapi: {
        method: 'POST',
        path: '/tasks',
        tags: ['task'],
        summary: 'Create a task.',
    }})
    .input(taskSchema.noHeadTask)
    .output(taskSchema.task)
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.task.create({
        data: input
      })
    }),
  ...
});
```

這裡有個問題，原本是希望 path 長得像這樣 /users/{userId}/tasks/{id}，但不知道為什麼一直失敗，目前還未解決。

### 前端實作

沒有另外引入狀態管理的工具，基本上就只使用 React Hooks 解決。在 index.tsx 可以看到使用了兩個 Model Hooks，一個是 for 首頁展示用的，一個是 for 真實資料庫介接使用的。然後根據使用者是否有登入，切換放入 TaskManager 的 model 是哪個。

```tsx
// src/pages/index.tsx

const Home: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();  
  const userId = sessionData && sessionData.user?.id || undefined
  const modelProps = { userId }
  const demoModel = useDemoTaskModel(modelProps)
  const prismaModel = usePrismaTaskModel(modelProps)
  ...

  return (
    <>
      <AppBody>
        ...
          <TaskManager model={model} />
        ...
      </AppBody>
    </>
  );
};

export default Home;

```

TaskManager 負責視覺呈現跟互動邏輯，跟資料操作與狀態管理相關的事情，都是使用傳入的 model 處理。傳入的 Model 必須要有符合的功能。
```tsx
// src/components/TaskManager.tsx
export interface TaskManagerProps {
  model: TaskModel
}

export const TaskManager = ({ model }: TaskManagerProps) => {
  const { todoList, finishList, archiveList, pushTask, finishTask, unfinishTask, archiveTask, unarchiveTask, deleteTask } = model

  const commands: Commands = {
    CANCEL: () => setEditingTask(NULL_EDITING_TASK),
    CREATE: (task = NEW_EDITING_TASK) => setEditingTask(task),
    SUBMIT: task => {
      task && pushTask(task)
      setEditingTask(NULL_EDITING_TASK)
    },
    UPDATE: task => setEditingTask({ ...task } as Task),
    FINISH: task => finishTask(task),
    UNFINISH: task => unfinishTask(task),
    ARCHIVE: task => archiveTask(task),
    UNARCHIVE: task => unarchiveTask(task),
    DELETE: task => deleteTask(task),
  }
...
```

useDemoTaskModel 負責展示用的資料狀態管理。部分邏輯使用 fp-ts 的方式實作。
```ts
// src/hooks/useDemoTaskModel.tsx
  const [taskList, setTaskList] = useState(defaultTaskList)
  const [todoList, setTodoList] = useState(todosFilter(taskList))
  const [finishList, setFinishList] = useState(finishesFilter(taskList))
  const [archiveList, setArchiveList] = useState(archivesFilter(taskList))

  useLayoutEffect(() => {
    const sorted = [...taskList].sort((a: Task, b: Task): number => a.id < 0 ? -1 : b.id - a.id)
    setTodoList(todosFilter(sorted))
    setFinishList(finishesFilter(sorted))
    setArchiveList(archivesFilter(sorted))
  }, [taskList])

  const pushTask: TaskModel['pushTask'] = (updatedTask: Task): void => {
    const isExist = taskList.some(task => task.id === updatedTask.id)
    pipe(
      O.some(isExist),
      O.map(
        B.match(
          () => createTask(updatedTask),
          () => {
            const updatedList: TaskList = pipe(taskList, A.filterMap(task => 
              task.id === updatedTask?.id ? O.some({...task, ...updatedTask}) : O.some(task)
            ))
            setTaskList(updatedList)
            return updatedTask
          }
        ),
      ),
    )
  }
```

usePrismaTaskModel 負責實際接資料庫的相關資料狀態管理。使用 create-t3-app 整合的 [tRPC](https://trpc.io/) 來打 API，基本上 [tRPC](https://trpc.io/) 內建是使用 [React-Query](https://react-query-v3.tanstack.com/)，因此會看到 useQuery 用來獲取獲取，以及 useMutaion 來處理更新。

另外在資料更動的時候，從 onMutate 的時候，可以插入先行調整呈現的資料，等到資料更新的 API 打完之後，再去重新獲取資料一次，可以改善使用者體驗，不需要等待 API 打完回來，就可以偷跑看到更新結果。

```ts
// src/hooks/usePrismaTaskModel.ts
export const usePrismaTaskModel: UseTaskModel = ({ userId = '' } = {}) => {
  const utils = api.useContext()

  const [todoList, setTodoList] = useState<TaskList>([])
  const { data: newTodoList } = api.task.todoList.useQuery({ userId })

  useLayoutEffect(() => {
    setTodoList(newTodoList || [])
  }, [newTodoList])

  const createTaskMutation = api.task.create.useMutation({
    async onMutate (newTask) {
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      await utils.task.todoList.cancel();
      // // Get the data from the queryCache
      const prevData = utils.task.todoList.getData();
      // // Optimistically update the data with our new post
      const tmpNewTaskForDisplay = { ...newTask, id: -2 }
      utils.task.todoList.setData({ userId }, (old) => old ? [tmpNewTaskForDisplay, ...old] : []);
      // // Return the previous data so we can revert if something goes wrong
      return { prevData };
    },
    async onSettled () {
      // Sync with server once mutation has settled
      await utils.task.todoList.invalidate();
    }
  })

  const createTask: TaskModel['createTask'] = task => {
    const { id, ...noHeadTask } = task
    createTaskMutation.mutate(noHeadTask, {
      onSuccess: (data, variables, context) => {
        console.log(`created`, data)
      },
      onError: (error, variables, context) => {
        console.log(`An error happened! ${error.message}`)
      },
    })
  }
```

這邊後來想要分三個 list 各自打 API 獲取資料，但是這個改動幅度太大了，導致時間上太趕著寫， 實作的方式並不是很好，未來需要重構。另外也導致 onMutate 先行更改畫面的資料，但實現上使用體驗不佳的問題。以及另一個原本拿當前呈現的資料的方法，不知道為什麼忽然都拿不到，原本是可以的，找不太到原因。

```ts
const pushTaskMutation = api.task.push.useMutation({
    async onMutate (newTask) {      
      // TODO: don't know why getData() always return undefined
      const prevTodoList = utils.task.todoList.getData()
      ...
    }
})
```

最後 HTML 的部分，幾乎都是使用 [React Spectrum](https://react-spectrum.adobe.com/) 處理，使用的時候，遇到不少坑。最大的問題是不知道為何，跟 Next.js 一起用的時候，跟 Collections 有關的組件都會有問題，目前無解，都先不用。以及另一個是，我找不到它希望怎麼樣定義字體的官方方式，所以都沒特別修改字體大小。

```tsx
// src/components/TaskManager.tsx
<Content margin="size-200" marginBottom="size-800">
  {
    editingTask && isNewEditing(editingTask) ?
      <EditTask
        task={editingTask}
        onSubmit={commands[Actions.Submit]}
        onCansel={commands[Actions.Cancel]}
      /> :
      null
  }
  
  {todoList.map(task => {
    return (
      editingTask && isEditing(editingTask, task) ?
        <EditTask
          key={`editing-${task.id}`}
          task={editingTask}
          onSubmit={commands[Actions.Submit]}
          onCansel={commands[Actions.Cancel]}
        /> :
        <Flex key={task.id} justifyContent="space-between">
          <Checkbox marginEnd="size-200" flexGrow={1} isSelected={task.isFinished} onChange={onCheckboxChange(task)}>
            {task.title}
          </Checkbox>
          <ButtonGroup>
            <ActionButton isQuiet onPress={e => commands[Actions.Update](task)} aria-label="Edit task"><EditIcon /></ActionButton>
            <ActionButton isQuiet onPress={e => commands[Actions.Archive](task)} aria-label="Archive task"><ArchiveIcon /></ActionButton>
            <ActionButton isQuiet onPress={e => commands[Actions.Delete](task)} aria-label="Delete task"><DeleteIcon /></ActionButton>
          </ButtonGroup>
        </Flex>
    )
  })}
</Content>
```

### Review

總結一下遇到的問題：
- 如何用 TypeScript 定義 Type ，再轉成 Zod 的定義?
- 使用 NextAuth 增加不同的登入方式
- 使用 trpc-openapi 的插件時， path parameters 一直都有問題，目前還未解決，例如 /users/{userId}/tasks/{id}
- fp-ts 需要重頭看起，目前大概知道怎麼用的功能很少，實際原理也一知半解，底層概念沒完整看完，導致實作上經常不知道該怎麼辦。
- 重構 usePrismaTaskModel ，主要是分三個 list 的改寫，第一版的實現非常不好，不易懂也不好維護。
- 更改資料之後的使用體驗不佳，需要一併修正。
- React Spectrum 跟 Next.js 搭配使用時，使用 COllections 相關的組件都會有問題。
- React Spectrum 不知道官方設計是希望如何定義字體
- 還沒寫單元測試跟整合測試
- 時間分配不當，沒有寫到測試，也來不及詳細紀錄過程，多做了太多其他的東西
- 最後時間太趕，收尾不乾淨

## 過程紀錄 (可以不用看了，重要的都在上面講到了)

### Day 0

主要在搜尋一些比較好的解決方案，來做一個全端的 todo-list。原本想法是基於 Next.js 就可以前後端一起開發，並且之前就想試試 Primsa，最後看到了 create-t3-app，省去了很多設置跟整合的麻煩，就決定趁這個機會試試。另一個寶藏是他們的[其他推薦](https://create.t3.gg/en/other-recs)，裡面提到很多很好用的工具，真的是挖到寶。

這次想要用的工具有這些：
- [create-t3-app](https://create.t3.gg/): The best way to start a full-stack, typesafe Next.js app，整合了以下幾個工具，開箱即用。
  - [Next.js](https://nextjs.org/)
  - TypeScript
  - [tRPC](https://trpc.io/): 類型安全的 API 開發框架，因前後端都使用 TypeScript，藉此保證 API 修改後、使用時的類型是正確的。
  - [Prisma](https://www.prisma.io/): 比較新的 ORM，開發體驗看起來很棒。
  - [Tailwind CSS](https://tailwindcss.com/): Utility CSS，之前用過一次。
  - [NextAuth.js](https://next-auth.js.org/): 順便試試，畢竟登入很常需要。
- [Jotai](https://github.com/pmndrs/jotai): 用來做狀態管理，基於 atomic, bottom-up 的概念設計。
- [React Spectrum](https://react-spectrum.adobe.com/): 基於 Adobe 出的設計系統 Spectrum 所出的 UI Library，另外還有 Web Components 版，特色是無障礙、自適應、國際化的組件設計。它底層把組件(react-spectrum)、行為(react-aria)、狀態(react-stately) 三者分開，例如如果不想要樣式，可以使用 react-aria 來搭建自己的組件庫與設計樣式。

另外也希望可以了解 DDD 跟 FP，看了以下的一些資料。fp-ts 內容比較多，簡單先看了一些。
- [fp-ts](https://gcanti.github.io/): TypeScript 用來實踐 Functional Programming 的工具。
- [Domain-Driven Design](https://hackmd.io/@oomusou/BkYdPvEnU?utm_source=preview-mode&utm_medium=rec): 一種系統設計的方法，強調在所有人之間建立一種共通的領域模型與詞彙，並依此進行實務開發。
- [Domain Modeling Made Functional](https://www.youtube.com/watch?v=2JB1_e5wZmU): 將 Domain-Driven Design 跟 Functional Programming 結合使用。


部署的話，我們目前都用 [Vercel](https://vercel.com/) 跟 [Railway](https://railway.app/)。Railway 這次主要用來開 PostgreSQL。

其他順帶一提的
- [Zustand](https://github.com/pmndrs/zustand): 看起來就是更簡單好用的 Redux，同樣基於 top-down 的設計概念。
- [Class Variance Authority](https://github.com/joe-bell/cva): 自建 UI Library 用的，可以更容易的自行定義設計系統。搭配 Tailwind CSS 跟無樣式的組件庫，可以比較容易地創建自己的元件庫跟樣式設計(相較於對既有樣式的組件庫進行大幅調整)。
- [create-t3-app 的其他推薦](https://create.t3.gg/en/other-recs)


### Day 1
先來做專案初始化吧～

跟著[文檔](https://create.t3.gg/en/installation)照做，執行以下命令，他會問你專案名稱跟配置項目，選一選就可以了。
```
npm create t3-app@latest
```

我們有選 NextAuth.js，他會連 db schema 都會配置好 ([詳細文檔說明](https://next-auth.js.org/adapters/prisma))，初始使用的是 SQLite。 npm run dev 之後，就會看到畫面並且有一個登入的按鈕。初始配置是只有使用 Discord 登入，但如果你按下去，會發現不成功，因為還要做一些設置。詳細可以看[文件](https://create.t3.gg/en/usage/first-steps)，寫得簡單清楚。照著配置完之後，基本上本地就可以登入了！並且會將登入資訊記錄在資料庫裡。

接下來要將 SQLite 換成 PostgreSQL，詳細可以參考[這篇](https://dev.to/nexxeln/build-a-full-stack-app-with-create-t3-app-5e1e)。基本上就是到 Railway 開一個 db，把連結複製下來，修改 .env，然後修改 provider 配置，記得要將db type 的註解打開。配置好之後執行 npx prisma db push，就會看到資料表初始化成功，然後運行 npm run dev 就可以登入了。

部署到 Vercel 之後，確認登入 ok 就完成了第一步驟。

接著安裝一下 [React Spectrum](https://react-spectrum.adobe.com/)，我們有用到 Next.js，所以要照著[這裡](https://react-spectrum.adobe.com/react-spectrum/ssr.html#nextjs)的方式設定，可能是版本的問題，@spectrum-icons/illustrations 這個引入會出錯，目前先 skip 它。

然後今天都在嘗試工具，一邊熟悉，一邊思考要怎麼設計。tRPC 的概念是從 prisma 的資料庫定義轉換出 Types，這點跟 DDD 與 FP 的思維有點差異，如果要用 Domain-Driven 的思維開始建構的話，應該是資料庫使用 Domain 的 Types，但 prisma 的資料庫型別只能用他的語法去定義，不能引入 TypeScript Types，所以還是得分兩次定義。另外 prisma 跟 tRPC 都是用 Schema 轉出的 Types 來保證類型安全，目前是想說如果是一樣的，那就用資料庫轉出的就好了，如果不一樣，再用自己定義的 Types。

### Day 2

結果今天都在跟 React-Spectrum 鬼打牆，想說把功能畫面大概做一個程度出來，比較好想像。但遇到好幾個 React-Spectrum 的問題：
1. ListView 在 Next.js SSR 的時候會有問題。一加上去就會噴 Cannot read properties of null (reading 'collection')。只要是 Collections 都會有這個狀況，試了半天，後來放棄用它了。
2. 找了超久，還是搞不懂 React-Spectrum 該怎麼調整字體大小。有看到它有很多 CSS 變數，但完全沒看到範例要怎麼用，Component 上也沒有辦法直接傳 Props 去定義，還是都要直接呼叫他的 CSS 變數？完全沒搞懂它的邏輯。
3. 其他還有幾個 React-Spectrum 在 SSR 的問題，目前都還不清楚該如何處理。

最後上面幾個問題暫時都先放棄了，擱置不處理。不太想要寫自定義的 Style，先用預設的 font-size，不另外自己調整。為此需要把 Tailwind 的 Preflight CSS 關掉，讓 H1 ~ H6 的 font-size 保留瀏覽器預設，以及留著幾個看到需要的。

```css
/* @tailwind base; */
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  line-height: inherit;
}

*,
::before,
::after {
  box-sizing: border-box;
}
```

另外昨天裝 React-Spectrum 的時候，SSR 設定看到舊版的設定方式了，導致有些問題。改回用符合版本的設定方式就正常了 (在 next.config.js 裡要載入 CSS 的設定，要使用 transpilePackages 而不是 next-transpile-modules 的方式)。

```js
// next.config.mjs
const config = {
  transpilePackages: [
    '@adobe/react-spectrum',
    '@react-spectrum/actiongroup',
    '@react-spectrum/breadcrumbs',
    ...
  ],
};
export default config;
```

剩下的時間我們把功能大概實作一下，目前寫的還有點醜，也沒有接後端，但大致上將功能實作出來，初步可以使用了，後面再繼續調整。

### Day 3 & Day 4

對整體有個概念之後，我們今天把 fp-ts 引入進來使用，並從 DDD 的概念著手，重新思考一次如何建模。

大概看一下 FP 的實作上的概念，最困難的應該是 Algebraic structure 了，許多基本概念都是源自於此，還要花上一段時間全部看過跟熟悉，這邊先看個感覺。中文很推薦這篇：[ Functional Programming For Everyone ](https://ithelp.ithome.com.tw/articles/10262566)。大概快速看了一半，剩下的還要再看。

然後開始寫之後，困難重重。經常遇到型別報錯、輸入輸出跟預期不符、對 fp-ts 熟悉度不夠、基礎概念不足、不知道從何查起等等一堆問題。例如基底類型想要使用 Option，但實作時經常搞不懂 fp-ts 的概念跟邏輯，導致各種問題曾出不窮。還有個型別報錯，搞了半天還是不知道是為何？結果最後是使用的地方匯入錯誤，根本跟邏輯無關啊啊啊啊。

總之，裝了 fp-ts 之後，試著用該邏輯改寫之後，就是災難的開始。花了兩天多都在處理一些不知道為何而錯的情況。最後連 Option 都沒用上，很多地方知道要的結果是什麼，但完全實作不出來。

## Day 5

今天把新增功能跟編輯功能完成，並且整理一版 Code。又遇到了一次 React-Spectrum 的問題，暫時都不用它的 Collection or Group 相關的組件，避免潛在問題。

## Day 6 ~ Day 8

一言以敝之，好多問題。😭

## Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
