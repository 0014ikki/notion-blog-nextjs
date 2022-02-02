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
            const date = new Date(post.properties.Date.date.start).toLocaleString(
              "ja-JP",
              {
                month: "short",
                day: "2-digit",
                year: "numeric",
              }
            );
            
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
                <span>
                  <span className={styles.postDescription}>{date}</span>
                  <Link href={`/${post.properties.Slug.rich_text[0]?.plain_text}`}>
                    <a className={styles.postTitle}>
                      <Text text={post.properties.Page.title} />
                    </a>
                  </Link>
                  
                </span>
                
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
