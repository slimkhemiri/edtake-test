import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { v4 as uuidv4 } from 'uuid';

interface CartProduct {
    id: string;
    name: string;
    url: string;
};

interface CartToolInput {
    action: 'add' | 'remove' | 'list';
    product?: {
        name: string;
        url: string;
    };
    productId?: string;
};

@Injectable()
export class CartService {
    private cartFilePath = path.resolve(__dirname, '../../data/cart.json');
    private cart: CartProduct[] = [];

    constructor() {
        this.loadCartFromFile();
    };

    async loadCartFromFile() {
        try {
            const dataDir = path.dirname(this.cartFilePath);
            if (!fs.existsSync(dataDir)) {
                await fs.promises.mkdir(dataDir, { recursive: true });
            }

            if (!fs.existsSync(this.cartFilePath)) {
                const defaultCart: CartProduct[] = [];
                await fs.promises.writeFile(this.cartFilePath, JSON.stringify(defaultCart, null, 2), 'utf-8');
                this.cart = defaultCart;
                return defaultCart;
            }

            const data = await fs.promises.readFile(this.cartFilePath, 'utf-8');
            const cartData: CartProduct[] = JSON.parse(data);
            return cartData;
        } catch (error) {
            console.error('Erreur lors du chargement du fichier JSON:', error);
            this.cart = [];
            return [];
        }
    };

    async saveCartToFile() {
        try {
            const cartData = this.cart;
            await fs.promises.writeFile(this.cartFilePath, JSON.stringify(cartData, null, 2), 'utf-8');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du fichier JSON:', error);
        }
    };

    async addToCart(product: { name: string; url: string }) {
        const newProduct = {
            id: uuidv4(),
            ...product,
        };
        this.cart.push(newProduct);
        await this.saveCartToFile();
        return `Le produit "${newProduct.name}" a été ajouté au panier avec l'ID "${newProduct.id}".`;
    };

    async removeFromCart(productId: string) {
        const index = this.cart.findIndex((item) => item.id === productId);
        if (index !== -1) {
            const removed = this.cart.splice(index, 1);
            await this.saveCartToFile();
            return `Le produit "${removed[0].name}" a été retiré du panier.`;
        }
        return `Produit non trouvé dans le panier.`;
    };


    listCart() {
        if (this.cart.length === 0) {
            return 'Votre panier est vide.';
        }
        const items = this.cart
            .map((item) => `${item.name} - (${item.url})`)
            .join(', ');
        return `Votre panier contient les articles suivants : ${items}.`;
    };


    getCartTool() {
        return tool(
            async (input: CartToolInput): Promise<string> => {
                const product = {
                    name: input.product.name,
                    url: input.product.url,
                };
                switch (input.action) {
                    case 'add':
                        return this.addToCart(product);
                    case 'remove':
                        return this.removeFromCart(input.productId);
                    case 'list':
                        return this.listCart();
                    default:
                        return 'Action non reconnue.';
                }
            },
            {
                name: 'cart_tool',
                description: 'Outil pour gérer le panier (ajouter, supprimer ou lister des produits).',
                schema: z.object({
                    action: z.enum(['add', 'remove', 'list']).describe(
                        'Action à effectuer sur le panier (add, remove, list).',
                    ),
                    product: z
                        .object({
                            id: z.string(),
                            name: z.string(),
                            url: z.string(),
                        })
                        .optional()
                        .describe('Détails du produit à ajouter.'),
                    productId: z.string().optional().describe('ID du produit à supprimer.'),
                }),
            },
        );
    }
};
