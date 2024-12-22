import { Injectable } from '@nestjs/common';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

interface TavilySearchInput {
    query: string;
}

interface TavilySearchResult {
    title: string;
    url: string;
    description?: string;
}

@Injectable()
export class TavilyService {
    private tavilyApiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.validateApiKey();
    }

    private validateApiKey() {
        this.tavilyApiKey = this.configService.get<string>('TAVILY_API_KEY');
        if (!this.tavilyApiKey) {
            throw new Error('La clé API Tavily est manquante.');
        }
    }

    getTavilyTool() {
        return tool(
            async (input: TavilySearchInput): Promise<TavilySearchResult[]> => {
                try {
                    const tavilySearch = new TavilySearchResults({
                        maxResults: 2,
                        apiKey: this.tavilyApiKey,
                    });
                    const results: TavilySearchResult[] = await tavilySearch.invoke(input.query);
                    return results;
                } catch (error) {
                    console.error('Erreur lors de la recherche Tavily:', error);
                    throw new Error('Une erreur est survenue lors de la recherche Tavily.');
                }
            },
            {
                name: 'tavily_tool',
                description:
                    'Outil Tavily pour effectuer des recherches en ligne et récupérer des recommandations de produits.',
                schema: z.object({
                    query: z.string().describe(
                        'Requête de recherche en ligne pour trouver des produits ou informations.',
                    ),
                }),
            },
        );
    }
}
