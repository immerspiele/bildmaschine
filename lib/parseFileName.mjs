import * as ImageTypes from './imageTypes.mjs';
import path from 'node:path';

const parseEncodedInteger = (value) => {
  const integer = parseInt(value, 36);

  if (Number.isNaN(integer)) {
    return null;
  }

  return integer;
};

const parseEncodedIntegerStrict = (value) => {
  const integer = parseEncodedInteger(value);

  if (integer === null) {
    throw new Error(`Invalid encoded integer: ${value}`);
  }

  return integer;
};

const parseSize = (sizeString) => {
  const parts = sizeString.split('-');

  if (parts.length === 1) {
    const size = parseEncodedIntegerStrict(parts[0]);

    return {
      width: size,
      height: size,
    };
  }

  let width = null;
  let height = null;

  if (parts[0] !== '') {
    width = parseEncodedIntegerStrict(parts[0]);
  }

  if (parts[1] !== '') {
    height = parseEncodedIntegerStrict(parts[1]);
  }

  return { width, height };
};

const parseQuality = (qualityString) => {
  const quality = parseEncodedIntegerStrict(qualityString);

  if (quality < 1 || quality > 100) {
    throw new Error(`Invalid quality: ${qualityString}`);
  }

  return quality;
};

const parseFormat = (filePath) => {
  const basename = path.basename(filePath);
  const extension = path.extname(basename);

  if (!extension) {
    throw new Error(`Missing file extension: ${filePath}`);
  }

  const extensionType = extension.slice(1).toUpperCase();
  const format = ImageTypes[extensionType];

  if (!format) {
    throw new Error(`Unsupported file extension: ${extension}`);
  }

  let sourceFilePath = filePath.slice(0, -extension.length);
  if (path.extname(sourceFilePath) === '') {
    sourceFilePath = `${sourceFilePath}${extension}`;
  }

  return {
    format,
    sourceFilePath,
  };
};

const parseQueryString = (queryString) => {
  const parts = queryString.split('_');
  let bucket = null;
  let size = null;
  let quality = null;

  for (const part of parts) {
    if (part.startsWith('b')) {
      bucket = part.slice(1);
    } else if (part.startsWith('s')) {
      size = parseSize(part.slice(1));
    } else if (part.startsWith('q')) {
      quality = parseQuality(part.slice(1));
    }
  }

  return {
    bucket,
    size,
    quality,
  };
};

const encodeDestinationFilePath = (queryString, filePath) => {
  return `${queryString}-${filePath}`;
};

const parseFileName = (fileQuery) => {
  const index = fileQuery.indexOf('-');

  if (index === -1) {
    return;
  }

  const queryString = fileQuery.slice(1, index);
  const filePath = fileQuery.slice(index + 1);
  const query = parseQueryString(queryString);
  const { format, sourceFilePath } = parseFormat(filePath);
  const destinationFilePath = encodeDestinationFilePath(queryString, filePath);

  return {
    queryString,
    filePath,
    format,
    sourceFilePath,
    destinationFilePath,
    ...query,
  };
};

export default parseFileName;
