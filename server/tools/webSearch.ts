import type { WebSearchOutput, WebSearchResultItem } from '../../src/types/agent.js';

export async function executeWebSearch(params: { query: string; maxResults?: number }): Promise<WebSearchOutput> {
  const rawQuery = params.query?.trim();
  const maxResults = params.maxResults || 5;

  if (!rawQuery) {
    throw new Error('Search query parameter is missing or empty.');
  }

  // Generate intelligent search variants (e.g. full phrase, primary keywords, brand name)
  const queryVariants = [rawQuery];
  
  // Extract key entity if present
  if (/\b(openai)\b/i.test(rawQuery)) queryVariants.push('OpenAI');
  if (/\b(anthropic)\b/i.test(rawQuery)) queryVariants.push('Anthropic');
  if (/\b(deepmind|google deepmind)\b/i.test(rawQuery)) queryVariants.push('Google DeepMind');
  
  // Shorter 2-3 word version
  const words = rawQuery.split(/\s+/);
  if (words.length > 3) {
    queryVariants.push(words.slice(0, 3).join(' '));
  }

  const results: WebSearchResultItem[] = [];

  for (const query of queryVariants) {
    if (results.length >= maxResults) break;

    // Strategy 1: Wikipedia Full-Text Search API (Extremely rich, robust, verified URLs)
    try {
      const fullTextUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}&format=json&utf8=1`;
      const res = await fetch(fullTextUrl, {
        headers: {
          'User-Agent': 'JarvisOS-Autonomous-Agent/1.0 (Hackathon Research Engine)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const searchItems = data?.query?.search;
        if (Array.isArray(searchItems) && searchItems.length > 0) {
          for (const item of searchItems) {
            const cleanTitle = item.title;
            const cleanSnippet = (item.snippet || '')
              .replace(/<span class="searchmatch">/g, '')
              .replace(/<\/span>/g, '')
              .replace(/&quot;/g, '"')
              .replace(/&#039;/g, "'")
              .replace(/&amp;/g, '&');
            const pageUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanTitle.replace(/\s+/g, '_'))}`;

            results.push({
              title: cleanTitle,
              snippet: cleanSnippet || `Factual background and research regarding ${cleanTitle}.`,
              url: pageUrl,
            });
          }
        }
      }
    } catch (err) {
      console.warn('[webSearch] Wikipedia full-text search error:', err);
    }

    // Strategy 2: Wikipedia Opensearch (Prefix & Instant)
    if (results.length < maxResults) {
      try {
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=${maxResults}&namespace=0&format=json`;
        const res = await fetch(wikiUrl, {
          headers: {
            'User-Agent': 'JarvisOS-Autonomous-Agent/1.0',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length >= 4) {
            const titles = data[1] || [];
            const descriptions = data[2] || [];
            const urls = data[3] || [];

            for (let i = 0; i < titles.length; i++) {
              if (urls[i] && urls[i].startsWith('http')) {
                results.push({
                  title: titles[i],
                  snippet: descriptions[i] || `Information and research about ${titles[i]}`,
                  url: urls[i],
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('[webSearch] Wikipedia opensearch error:', err);
      }
    }

    // Strategy 3: DuckDuckGo Instant Answer API
    if (results.length < maxResults) {
      try {
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const res = await fetch(ddgUrl, {
          headers: {
            'User-Agent': 'JarvisOS-Autonomous-Agent/1.0',
          },
          signal: AbortSignal.timeout(5000),
        });

        if (res.ok) {
          const data: any = await res.json();
          if (data.Abstract && data.AbstractURL) {
            results.unshift({
              title: data.Heading || query,
              snippet: data.Abstract,
              url: data.AbstractURL,
            });
          }
        }
      } catch (err) {
        console.warn('[webSearch] DuckDuckGo API error:', err);
      }
    }
  }

  // Deduplicate results by URL
  const seenUrls = new Set<string>();
  const uniqueResults: WebSearchResultItem[] = [];

  for (const item of results) {
    if (!seenUrls.has(item.url) && item.url.startsWith('http')) {
      seenUrls.add(item.url);
      uniqueResults.push(item);
    }
  }

  const finalResults = uniqueResults.slice(0, maxResults);

  if (finalResults.length === 0) {
    throw new Error(`Web research failed: No verified search results found for query "${rawQuery}". Ensure network connectivity.`);
  }

  return {
    query: rawQuery,
    results: finalResults,
    source: 'Multi-Provider (Wikipedia Full-Text, Opensearch & DuckDuckGo)',
    count: finalResults.length,
  };
}
