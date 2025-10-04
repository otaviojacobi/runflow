import Image, { type ImageProps } from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center">
        <ThemeImage
          className="mb-4"
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />

        <Card className="max-w-md">
          <CardContent className="pt-6">
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Get started by editing <code className="bg-muted px-1.5 py-0.5 rounded text-sm">apps/web/app/page.tsx</code>
              </li>
              <li>Save and see your changes instantly.</li>
            </ol>
          </CardContent>
        </Card>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild size="lg">
            <a
              href="https://vercel.com/new/clone?demo-description=Learn+to+implement+a+monorepo+with+a+two+Next.js+sites+that+has+installed+three+local+packages.&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4K8ZISWAzJ8X1504ca0zmC%2F0b21a1c6246add355e55816278ef54bc%2FBasic.png&demo-title=Monorepo+with+Turborepo&demo-url=https%3A%2F%2Fexamples-basic-web.vercel.sh%2F&from=templates&project-name=Monorepo+with+Turborepo&repository-name=monorepo-turborepo&repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fturborepo%2Ftree%2Fmain%2Fexamples%2Fbasic&root-directory=apps%2Fdocs&skippable-integrations=1&teamSlug=vercel&utm_source=create-turbo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
                className="mr-2"
              />
              Deploy now
            </a>
          </Button>
          <Button variant="secondary" asChild size="lg">
            <a
              href="https://turborepo.com/docs?utm_source"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read our docs
            </a>
          </Button>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center">
        <a
          href="https://vercel.com/templates?search=turborepo&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://turborepo.com?utm_source=create-turbo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to turborepo.com →
        </a>
      </footer>
    </div>
  );
}
