import { VercelRequest, VercelResponse } from '@vercel/node';
import Parser from 'rss-parser';

const feeds = [
  'https://zenn.dev/mouse_484/feed',
  'https://qiita.com/mouse_484/feed.atom',
];

const parser = new Parser();

const isPlatform = (link: string) => {
  return ['qiita', 'zenn'].find((value) => link.includes(value));
};

export default async (_: VercelRequest, response: VercelResponse) => {
  const allfeed: Parser.Item[] = (
    await Promise.all(
      feeds.map(async (url) => {
        const feed = await parser.parseURL(url);
        console.log(feed.feedUrl, feed.items);
        return feed.items;
      })
    )
  ).flat();

  const result = allfeed
    .sort(
      (a, b) =>
        new Date(b?.isoDate || '').getTime() -
        new Date(a?.isoDate || '').getTime()
    )
    .map(({ title, link, isoDate }) => {
      return {
        title,
        link,
        isoDate,
        platform: isPlatform(link || ''),
      } as const;
    });

  response.status(200).json(result);
};
