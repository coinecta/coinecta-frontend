export const bytesToSize = (bytes: any) => {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export const aspectRatioResize = (sourceWidth: number, sourceHeight: number, maxWidth: number, maxHeight: number) => {
  const isLandscape: boolean = sourceWidth > sourceHeight;

  let newHeight: number;
  let newWidth: number;

  if (isLandscape) {
    newHeight = maxWidth * sourceHeight / sourceWidth;
    newWidth = maxWidth;
  }
  else {
    newWidth = maxHeight * sourceWidth / sourceHeight;
    newHeight = maxHeight;
  }

  return {
    width: newWidth.toString() + 'px',
    // height: newHeight.toString() + 'px',
    '&::after': {
      paddingTop: (newHeight / newWidth * 100).toString() + '%',
      display: 'block',
      content: '""'
    },
  }
}

export const formatNumber = (num: number, sigFig?: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else if (num >= 0.001) {
    return num.toFixed(sigFig && sigFig < 3 ? sigFig : 3).replace(/\.?0+$/, '');
  } else {
    if (sigFig && sigFig === 2) return '0.01'
    if (sigFig && sigFig === 1) return '0.1'
    return '0.001';
  }
};

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
  return encodeURIComponent(
    [...slug]
      .map((c) => (urlSafeChars.test(c) ? c : encodeURIComponent(c)))
      .join("")
  );
}