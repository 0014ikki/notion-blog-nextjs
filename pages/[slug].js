import { Fragment } from "react";
import Head from "next/head";
import { getDatabase, getPage, getBlocks } from "../lib/notion";
import Link from "next/link";
import { databaseId } from "./index.js";
import styles from "./post.module.css";
import fs from 'fs';
import YouTube from 'react-youtube'

export const Text = ({ text }) => {
  if (!text) {
    return null;
  }
  return text.map((value) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;
    return (
      <span
        className={[
          bold ? styles.bold : "",
          code ? styles.code : "",
          italic ? styles.italic : "",
          strikethrough ? styles.strikethrough : "",
          underline ? styles.underline : "",
        ].join(" ")}
        style={color !== "default" ? { color } : {}}
      >
        {text.link ? <a href={text.link.url}>{text.content}</a> : text.content}
      </span>
    );
  });
};


const renderBlock = (block) => {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p>
          <Text text={value.text} />
        </p>
      );

    case "heading_1":
      return (
        <h1>
          <Text text={value.text} />
        </h1>
      );

    case "heading_2":
      return (
        <h2>
          <Text text={value.text} />
        </h2>
      );

    case "heading_3":
      return (
        <h3>
          <Text text={value.text} />
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li>
          <Text text={value.text} />
        </li>
      );

    case "numbered_list_item":
      return (
        <li>
          <Text text={value.text} />
        </li>
      );

    case "to_do":
      return (
        <div>
          <label htmlFor={id}>
            <input type="checkbox" id={id} defaultChecked={value.checked} />{" "}
            <Text text={value.text} />
          </label>
        </div>
      );

    case "toggle":
      return (
        <details>
          <summary>
            <Text text={value.text} />
          </summary>
          {value.children?.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </details>
      );

    case "child_page":
      return <p>{value.title}</p>;

    case "image":
      // 外部埋め込み画像は現在非対応
      if (block.image.type === 'file') {
        return (
          <figure>
            <img
              src={value.file.url} // Notion s3 を使用する場合
              //src={'/blogImages/' + block.id + '.png'}
              //alt={getAltStr(value.caption)}
            />
          </figure>

        )
      }
    
    case "video":
      const opts = {
        height: '360',
        width: '640',
      };
      const vurl = value.external.url
      const vid = vurl.substr(vurl.indexOf('=') + 1)
      return (
      <YouTube videoId={vid} opts={opts} />
      );

    case "divider":
      return <hr key={id} />;

    case "quote":
      return <blockquote key={id}>{value.text[0].plain_text}</blockquote>;
    
    case "image":
      if (!isImageExist(block.id)) {
        const binary = blob.arrayBuffer()
        const buffer = Buffer.from(binary)
        saveImage(buffer, block.id)
      };

    default:
      return `❌ Unsupported block (${
        type === "unsupported" ? "unsupported by Notion API" : type
      })`;
  }
};

export default function Post({ page, blocks }) {
  if (!page || !blocks) {
    return <div />;
  }

  const tags = page.properties.Tag.multi_select.map((_) => _.name)
  const date = page.properties.Date.date.start;

  return (
    <div>
      <Head>
        <title>{page.properties.Page.title[0].plain_text}</title>
        {/* <link rel="icon" href="/favicon.ico" /> */}
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" href="/android-chrome-192x192.png" />
      </Head>

      <article>
        <h1 className={styles.name}>
          <Text text={page.properties.Page.title} />
        </h1>
        <div>
          <p>
            <span className={styles.info}>
              <span>📆 </span>
              {date}
            </span>
            {tags && (
              <span className={styles.info}>
                <span>🔖</span>
                {tags.map((tag) => (
                  //<Link href={`/tags/${encodeURIComponent(tag)}`} passHref prefetch={false} key={tag}>
                    <a>{tag} </a>
                  //</Link>
                ))}
              </span>
            )}
          </p>
        </div>
        <section className={styles.container}>
          {blocks.map((block) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
        </section>
      </article>
      <Link href="/">
        <a className={styles.back}>← Go home</a>
      </Link>
    </div>
  );
}

export const getStaticPaths = async () => {
  // データベースのすべてのデータを取得する
  // Slug のパスを静的に生成するのに必要
  const database = await getDatabase(databaseId)
  return {
    paths: database.map((page) => ({
      params: {
        slug: page.properties.Slug.rich_text[0].plain_text,
        id: page.id,
      },
    })),
    fallback: 'blocking',
  }
}

export const getStaticProps = async (context) => {
  const { slug } = context.params;
  const database = await getDatabase(databaseId, {
    and: [
      {
        property: 'Slug',
        text: {
          equals: slug,
        },
      },
    ],
  });

  // ページのメタデータを取得する
  const page = await getPage(database[0].id)

  // ページの本文を取得する
  const blocks = await getBlocks(database[0].id)

  // Retrieve block children for nested blocks (one level deep), for example toggle blocks
  // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = await Promise.all(
    blocks
      .filter((block) => block.has_children)
      .map(async (block) => {
        return {
          id: block.id,
          children: await getBlocks(block.id),
        };
      })
  );

  const blocksWithChildren = blocks.map((block) => {
    // Add child blocks if the block should contain children but none exists
    if (block.has_children && !block[block.type].children) {
      block[block.type]["children"] = childBlocks.find(
        (x) => x.id === block.id
      )?.children;
    }
    return block;
  });

  //イメージの取得
  const saveImage = async (imageBinary, keyName)  => {
    const imagesPath = 'public/blogImages'
    if (!fs.existsSync(imagesPath)) fs.mkdirSync(imagesPath)
    fs.writeFile(imagesPath + '/' + keyName + '.png', imageBinary, (error) => {
      if (error) {
        console.log(error)
        throw error
      }
    })
  }

  return {
    props: {
      page,
      blocks: blocksWithChildren,
    },
    //revalidate: 1,
  };
};
