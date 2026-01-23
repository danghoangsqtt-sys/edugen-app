
export interface ExternalWordData {
  word: string;
  phonetic?: string;
  phonetics: { text: string; audio?: string }[];
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
    synonyms: string[];
  }[];
}

export const fetchExternalDictionary = async (word: string): Promise<ExternalWordData | null> => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data[0] as ExternalWordData;
  } catch (error) {
    console.error("External Dictionary Error:", error);
    return null;
  }
};
