import { fallbackLng, languages } from '../i18n/settings';

export default async function Page({
  params: { lng },
}: {
  params: {
    lng: string;
  };
}) {
  if (languages.indexOf(lng) < 0) lng = fallbackLng;

  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}
