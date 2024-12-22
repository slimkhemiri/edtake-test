# Projet Edtake Test

## Comment lancer l’application

**Clés API**
   Créez un fichier `.env` à la racine du projet et renseignez-y les clés suivantes :

   ```env
   OPENAI_API_KEY=<votre-clé-API-OpenAI>
   TAVILY_API_KEY=<votre-clé-API-Tavily>
   LANGCHAIN_TRACING_V2=true
   LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"
   LANGCHAIN_API_KEY=<votre-clé-API-Langchain>
   LANGCHAIN_PROJECT="edtake-test-project"
   ```

## Installation

1. **Installer les dépendances**
   Exécutez la commande suivante pour installer les `node_modules` :

   ```bash
   npm install
   ```

2. **Démarrer le serveur**
   Lancez le serveur en mode développement avec la commande suivante :

   ```bash
   npm run start:dev
   ```

3. **Accès à l'application**
   L'application sera disponible sur le port `3000`. Par défaut, vous pouvez y accéder à l'adresse suivante :

   [http://localhost:3000]

## Description du projet

Ce projet met en avant une architecture modulaire, structurée autour de 3 services indépendants pour assurer une maintenance aisée et une évolutivité optimale. Voici les principaux composants du projet :

1. **Architecture modulaire**
   - **CartService** : Gère les opérations liées au panier.
   - **TavilyService** : Responsable de l'intégration avec l'API Tavily.
   - **CoordinatorService** : Orchestration des interactions entre les différents services.

2. **Agents intelligents**
   - Basés sur LangChain et LangGraph, les agents orchestrent les interactions entre les services de manière dynamique et intelligente.

3. **Traçabilité et auditabilité**
   - Langsmith assure la traçabilité des échanges et permet une auditabilité totale pour une transparence optimale.

4. **Configuration flexible**
   - Le fichier `.env` centralise la gestion des clés API et des paramètres critiques, facilitant leur modification sans avoir à intervenir directement dans le code source.