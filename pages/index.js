import Head from "next/head";
import Link from "next/link";
import { getDatabase } from "../lib/notion";
import { Text } from "./[slug]";
import styles from "./index.module.css";

export const databaseId = process.env.NOTION_DATABASE_ID;

export default function Home({ posts }) {
  return (
    <div>
      <Head>
        <title>0014 blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.container}>
        {/* <header className={styles.header}>
          <h1>0014 blog</h1>
        </header> */}

        <h2 className={styles.heading}>記事一覧</h2>
        <ol className={styles.posts}>
          {posts.map((post) => {
            const date = post.properties.Date.date.start;
            
            return (
//              <li key={post.id} className={styles.post}>
              <li key={post.properties.Slug.rich_text[0]?.plain_text} className={styles.post}>
                {/* <h3 className={styles.postTitle}>
                  <Link href={`/${post.properties.Slug.rich_text[0]?.plain_text}`}>
                    <a>
                      <Text text={post.properties.Page.title} />
                    </a>
                  </Link>
                </h3> */}
                  <a className={styles.date}>{date}</a>
                  <Link href={`/${post.properties.Slug.rich_text[0]?.plain_text}`}>
                    <a className={styles.postTitle}>
                      <Text text={post.properties.Page.title} />
                    </a>
                  </Link>
              </li>
            );
          })}
        </ol>
      </main>
    </div>
  );
}

export const getStaticProps = async () => {
  const database = await getDatabase(databaseId);
  // Publish されているデータを取得
//  const database = await getDatabase(process.env.NOTION_DATABASE_ID)
  return {
    props: {
      posts: database,
    },
    revalidate: 1,
  };
};
