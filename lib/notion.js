import { Client } from "@notionhq/client";
import { sleep } from './sleep'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// export const getDatabase = async (databaseId) => {
//   const response = await notion.databases.query({
//     database_id: databaseId,
//   });
//   return response.results;
// };

export const getDatabase = async (databaseId, _filter=undefined) => {
  console.log('🤟 getNotionData, fetch start ...')
  let results = []
  let hasMore = true // 再帰フェッチ用フラグ
  let cursor // 再帰フェッチ用フラグ

  // フィルタのベースとなるオブジェクト。Published のもののみを取得する。
  const filter = {
    and: [
      {
        property: 'Published',
        checkbox: {
          equals: true,
        },
      },
    ],
  }

  if (_filter?.and) {
    filter.and.push(..._filter.and)
  }

  // console.log(filter)

  //
  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
      start_cursor: cursor,
      filter,
    })

    results = results.concat(response.results)
    hasMore = response.has_more
    cursor = response.next_cursor
    await sleep(300)
    console.log('.')
  }

  console.log('🤟 getNotionData, fetch done')
  return results
};

export const getPage = async (pageId) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

// export const getBlocks = async (blockId) => {
//   const response = await notion.blocks.children.list({
//     block_id: blockId,
//     page_size: 50,
//   });
//   return response.results;
// };

export const getBlocks = async (blockId) => {

  console.log('👌 getBlocks, fetch start ...')

  let results = []
  let hasMore = true // 再帰フェッチ用フラグ
  let cursor // 再帰フェッチ用フラグ

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      page_size: 50,
      start_cursor: cursor,
    })

    results = results.concat(response.results)
    hasMore = response.has_more
    cursor = response.next_cursor
    await sleep(400)
    console.log('.')
  }

  console.log('👌 getBlocks, fetch done')

  // fs.writeFile('results2.json', JSON.stringify(results), (err) => {
  //   if (err) throw err
  //   console.log('正常に書き込みが完了しました')
  // })

  return results
}