import { Helmet } from 'react-helmet-async';

interface DynamicHeadProps {
  title: string;
  description: string;
  ogImage?: string;
}

export const DynamicHead: React.FC<DynamicHeadProps> = ({ title, description, ogImage }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <link rel="icon" href="/favicon.ico" />
    </Helmet>
  );
};

export default DynamicHead;