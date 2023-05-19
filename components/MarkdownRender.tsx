import { FC } from 'react'
import { Typography, List, ListItem, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { styled } from '@mui/system';
import Link from '@components/Link';

const MarkdownList = styled(List)({
  listStyle: 'disc',
  listStyleType: "disc",
  // listStylePosition: 'inside',
  padding: 0,
  marginLeft: '32px',
  marginBottom: '2rem',
  "& li": {
    display: 'list-item',
    paddingLeft: '6px',
  },
});

const MarkdownRender: FC<{description: string}> = ({description}) => {
  const theme = useTheme()
  const MarkdownListItem = styled(ListItem)({
    display: 'list-item',
    color: theme.palette.text.secondary,
    paddingTop: 0,
  });  
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, ...props }) => <Typography variant="h4" {...props} />,
        h2: ({ node, ...props }) => <Typography variant="h5" {...props} />,
        h3: ({ node, ...props }) => <Typography variant="h6" {...props} />,
        p: ({ node, ...props }) => <Typography variant="body1" sx={{ mb: 2 }} {...props} />,
        ul: ({ node, ...props }) => <MarkdownList {...props} />,
        li: ({ node, ...props }) => <MarkdownListItem {...props} />,
        a: ({ node, ...props }) => <Link {...props} href={props.href || '/'} sx={{ wordBreak: 'break-all' }} />,
      }}
      remarkPlugins={[remarkGfm]}
    >
      {description}
    </ReactMarkdown>
  );
};

export default MarkdownRender;
