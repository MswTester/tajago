import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import './styles/global.css';
import { LinksFunction } from "@remix-run/node";
import { cssBundleHref } from "@remix-run/css-bundle";

const usingFonts = [
  'Anton',
  'Roboto Mono',
  'Black Han Sans',
  'Black Ops One',
  'Bebas Neue',
  'Major Mono Display',
]

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel:'preconnect', href:'https://fonts.googleapis.com' },
  { rel:'preconnect', href:"https://fonts.gstatic.com", crossOrigin:'use-credentials'},
  { rel:'stylesheet', href:`https://fonts.googleapis.com/css2?${
    usingFonts.map((font) => `family=${font.replace(' ', '+')}`).join('&')
  }&display=swap`},
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
