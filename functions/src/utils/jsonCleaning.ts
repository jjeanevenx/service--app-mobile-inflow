export const cleanJsonString = (jsonString: string): string => {
  // Remove caracteres indesejados comuns que podem envolver o JSON
  const cleanedString = jsonString.trim()
                                .replace(/^```json/, "")
                                .replace(/^```/, "")
                                .replace(/```$/, "")
                                .trim();
  return cleanedString;
}