import { Button } from "@chakra-ui/react";

export default function Loader(props: {
  loadingText?: string
}) {
  const defaultLoadingText = '加载中...'

  return <Button isLoading={true} loadingText={props.loadingText ? props.loadingText : defaultLoadingText} disabled variant="ghost" />;
}
