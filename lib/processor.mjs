import { Readable } from 'stream';
import sharp from 'sharp';
import config from './config.mjs';

export const resize = () => {};

export const perform = async (query) => {
  const url = config.buckets[query.bucket].url + query.sourceFilePath;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }

  const readableStream = Readable.fromWeb(response.body);
  let transformer = sharp();

  if (query.size) {
    transformer = transformer.resize(query.size.width, query.size.height);
  }

  if (query.format) {
    const formatOptions = {};

    if (query.quality) {
      formatOptions.quality = query.quality;
    }

    transformer = transformer.toFormat(query.format.extension, formatOptions);
  }

  return {
    stream: readableStream.pipe(transformer),
    format: query.format,
  };
};
