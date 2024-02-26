export const bytesToSize = (bytes: any) => {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export const formatNumber = (num: number, sigFig: number = 3, fixed?: boolean) => {
  const sign = num < 0 ? '-' : '';
  const absNum = Math.abs(num);

  const formatSmallNumber = (number: number) => {
    if (number === 0) return '0';

    const magnitude = Math.floor(Math.log10(number));
    const multiplier = Math.pow(10, sigFig - magnitude - 1);
    const rounded = Math.round(number * multiplier) / multiplier;

    return rounded.toString();
  };

  if (absNum >= 1e18) { // 1 quintillion
    return sign + (absNum / 1e18).toFixed(2).replace(/\.0$/, '') + 'Qi';
  } else if (absNum >= 1e15) { // 1 quadrillion
    return sign + (absNum / 1e15).toFixed(2).replace(/\.0$/, '') + 'Q';
  } else if (absNum >= 1e12) { // 1 trillion
    return sign + (absNum / 1e12).toFixed(2).replace(/\.0$/, '') + 'T';
  } else if (absNum >= 1e9) { // 1 billion
    return sign + (absNum / 1e9).toFixed(2).replace(/\.0$/, '') + 'B';
  } else if (absNum >= 1e6) { // 1 million
    return sign + (absNum / 1e6).toFixed(2).replace(/\.0$/, '') + 'M';
  } else if (absNum >= 1000) { // 1 thousand
    return sign + (absNum / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (fixed && absNum < 10) {
    return sign + absNum.toFixed(sigFig);
  } else if (absNum >= 1) {
    // Round numbers close to whole numbers
    const rounded = Math.round(absNum * Math.pow(10, sigFig)) / Math.pow(10, sigFig);
    return sign + parseFloat(rounded.toFixed(sigFig)).toString();
  } else {
    return sign + formatSmallNumber(absNum);
  }
};

export const roundToTwo = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const stringToUrl = (str: string): string | undefined => {
  if (str) {
    // Replace all spaces with dashes and convert to lowercase
    str = str.replace(/\s+/g, '-').toLowerCase();
    // Remove all special characters using a regular expression
    str = str.replace(/[^\w-]+/g, '');
    return str;
  }
  else return undefined
}

export const slugify = (str: string) => {
  const urlSafeChars = /[a-z0-9-]/;
  const slug = str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

  let encodedSlug = '';
  for (let i = 0; i < slug.length; i++) {
    encodedSlug += urlSafeChars.test(slug[i]) ? slug[i] : encodeURIComponent(slug[i]);
  }

  return encodeURIComponent(encodedSlug);
};

export const getShortAddress = (address: string): string => {
  let shortAddress = address ? address : '';
  shortAddress =
    shortAddress.length < 10
      ? shortAddress
      : shortAddress.substring(0, 6) +
      '...' +
      shortAddress.substring(shortAddress.length - 4, shortAddress.length);

  return shortAddress;
};

export const getShorterAddress = (address: string, substring?: number): string => {
  let shortAddress = address ? address : '';
  shortAddress =
    shortAddress.length < 5
      ? shortAddress
      : shortAddress.substring(0, substring ? substring : 3) + '..' +
      shortAddress.substring(shortAddress.length - (substring ? substring : 3), shortAddress.length);

  return shortAddress;
};

export const ensureHexColor = (colorString: string): `#${string}` => {
  // Check if it's already a hex color
  if (/^#([0-9A-F]{3}){1,2}$/i.test(colorString)) {
    return colorString as `#${string}`;
  }

  // Convert RGB or RGBA to hex
  const match = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d+)?\)/);
  if (match) {
    const hex = match.slice(1, 4).map(num => {
      const hexVal = parseInt(num, 10).toString(16);
      return hexVal.length === 1 ? '0' + hexVal : hexVal;
    }).join('');
    return `#${hex}` as `#${string}`;
  }

  return '#000000' as `#${string}`;
};