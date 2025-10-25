import { PROMPT_CONTENT_CURATOR } from "../constants/prompt";

export const getContentCuratorPrompt = (
  interest: string,
  webResults: any[]
): string => {
  return PROMPT_CONTENT_CURATOR.replace(
    "#interest",
    interest
  ).replace("#webResults", JSON.stringify(webResults));
};