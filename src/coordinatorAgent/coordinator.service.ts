import { Injectable } from '@nestjs/common';
import { CartService } from '../cartAgent/cart.service';
import { TavilyService } from '../tavilyAgent/tavily.service';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { CompiledStateGraph, MemorySaver, Messages, StateDefinition, StateType, UpdateType } from '@langchain/langgraph';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { traceable } from 'langsmith/traceable';

@Injectable()
export class CoordinatorService {
    private readonly coordinatorAgent: CompiledStateGraph<
        StateType<{ messages: import('@langchain/langgraph').BinaryOperatorAggregate<BaseMessage[], Messages> }>,
        UpdateType<{ messages: import('@langchain/langgraph').BinaryOperatorAggregate<BaseMessage[], Messages> }>,
        'tools' | '__start__' | 'agent', any, any, StateDefinition>;
    private readonly memorySaver: MemorySaver;
    private readonly openAIModel: ChatOpenAI;

    constructor(
        private readonly cartService: CartService,
        private readonly tavilyService: TavilyService,
        private readonly configService: ConfigService,
    ) {
        const openAIApiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!openAIApiKey) {
            throw new Error('La clé API OpenAI est manquante.');
        }

        this.memorySaver = new MemorySaver();
        this.openAIModel = new ChatOpenAI({
            model: 'gpt-4o',
            openAIApiKey,
            temperature: 0,
        });

        const cartTool = this.cartService.getCartTool();
        const tavilyTool = this.tavilyService.getTavilyTool();

        this.coordinatorAgent = createReactAgent({
            llm: this.openAIModel,
            tools: [cartTool, tavilyTool],
            checkpointSaver: this.memorySaver,
        });
    }

    async handleUserQuery(userQuery: string): Promise<string> {
        const threadId = uuidv4();
        const inputs = {
            messages: [new HumanMessage(userQuery)],
        };
        try {
            const state = await traceable(async () =>
                await this.coordinatorAgent.invoke(inputs, { configurable: { thread_id: threadId } })
            )();
            const response = state.messages[state.messages.length - 1]?.content;
            if (!response) {
                throw new Error('La réponse générée par l\'agent est vide.');
            }
            return response;
        } catch (error) {
            throw new Error(`Erreur lors du traitement de la requête utilisateur : ${error.message}`);
        };
    };
};
