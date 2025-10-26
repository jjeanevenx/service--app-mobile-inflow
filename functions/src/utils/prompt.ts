import { PROMPT_CONTENT_CURATOR, PROMPT_CONTENT_PATH_CURATOR, PROMPT_NEWS_DISCOVERY } from "../constants/prompt";

export const getContentCuratorPrompt = (
  interest: string,
  webResults: any[]
): string => {
  return PROMPT_CONTENT_CURATOR.replace(
    "#interest",
    interest
  ).replace("#webResults", JSON.stringify(webResults));
};

export const getContentPathCuratorPrompt = (
  goal: string,
  combinedContent: any[]
): string => {
  return PROMPT_CONTENT_PATH_CURATOR.replace(
    "#goal",
    goal
  ).replace("#content", JSON.stringify(combinedContent));
};

export const getNewsDescoveryCuratorPrompt = (
  interest: string,
  news: any[]
): string => {
  return PROMPT_NEWS_DISCOVERY.replace(
    "#interest",
    interest
  ).replace("#news", JSON.stringify(news));
};