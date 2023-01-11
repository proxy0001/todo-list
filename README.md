# t3-todo-list

使用新工具們做一個 todo-list，包含[create-t3-app](https://create.t3.gg/), [tRPC](https://trpc.io/), [Prisma](https://www.prisma.io/), [NextAuth.js](https://next-auth.js.org/), [React Spectrum](https://react-spectrum.adobe.com/), [Class Variance Authority](https://github.com/joe-bell/cva) 等。

## 過程紀錄

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
