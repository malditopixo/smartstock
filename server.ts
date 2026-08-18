import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // AI Stock Analysis Endpoint
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { prompt, quickAction, products, movements } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      const systemInstruction = `Você é o "Assistente Inteligente de Estoque" do aplicativo SmartStock.
Seu objetivo é analisar os dados de estoque e histórico de movimentações fornecidos e responder às dúvidas do usuário com clareza, objetividade e precisão.

REGRAS ESTRITAS:
1. Responda SOMENTE com base nos dados de estoque e movimentações fornecidos no contexto.
2. NUNCA invente produtos, quantidades, códigos, categorias ou movimentações que não existam no contexto.
3. Se a informação não estiver disponível nos dados, responda claramente: "Não existem dados suficientes no sistema para essa análise."
4. Um item está em "ESTOQUE CRÍTICO / ZERADO" se a quantidade atual for 0.
5. Um item está em "ESTOQUE BAIXO / ALERTA" se a quantidade atual for menor ou igual ao estoque mínimo (e maior que 0).
6. Um item está em "ESTOQUE REGULAR" se a quantidade for maior que o estoque mínimo.
7. Quando listar produtos (especialmente itens críticos, alertas ou sugestões de reposição), estruture cada produto claramente com os seguintes campos:
   **[Número]. [Nome do Produto]** (\`[Código]\`)
   - **Prioridade:** 🔴 MÁXIMA / ⚠️ ALTA / 🟢 REGULAR
   - **Estoque Atual:** [Qtd] [Unidade] | **Mínimo:** [Qtd] [Unidade]
   - **Status:** [Totalmente esgotado / Abaixo do nível mínimo / Nível seguro]
   - **Recomendação:** [Ação recomendada de compra/reposição]
8. Idioma: Português do Brasil.`;

      let queryText = prompt || "";
      if (quickAction === "ANALISAR_ESTOQUE") {
        queryText = "Faça um resumo e análise completa do estoque atual, destacando total de produtos, unidades totais, saúde do estoque e recomendações.";
      } else if (quickAction === "ITENS_CRITICOS") {
        queryText = "Quais produtos estão em situação crítica (estoque zerado) ou com estoque baixo (abaixo ou igual ao mínimo)? Liste nomes, códigos, quantidades atuais e mínimas.";
      } else if (quickAction === "SUGERIR_REPOSICAO") {
        queryText = "Sugira quais itens devem ter prioridade de reposição com base no estoque atual versus estoque mínimo e histórico recente, indicando quantidade sugerida.";
      } else if (quickAction === "RESUMO_MOVIMENTACOES") {
        queryText = "Resuma as movimentações recentes de estoque (entradas e saídas), informando totais movimentados e últimas operações.";
      }

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        // Return structured local analytical response if Gemini API Key not yet injected
        const localResponse = generateLocalAnalysis(quickAction, queryText, products || [], movements || []);
        return res.json({ response: localResponse, source: "local" });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const contextPayload = `
DADOS ATUAIS DE PRODUTOS NO ESTOQUE:
${JSON.stringify(products || [], null, 2)}

HISTÓRICO RECENTE DE MOVIMENTAÇÕES:
${JSON.stringify(movements || [], null, 2)}
`;

      const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-3.7-flash",
        "gemini-2.5-flash-lite",
      ];

      let generatedText: string | null = null;

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: `${contextPayload}\n\nPERGUNTA OU AÇÃO DO USUÁRIO:\n${queryText}`,
            config: {
              systemInstruction,
              temperature: 0.2,
            },
          });

          if (response && response.text) {
            generatedText = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} encountered error or high demand (503/429), trying fallback model...`);
        }
      }

      if (generatedText) {
        return res.json({ response: generatedText, source: "gemini" });
      }

      // If all Gemini remote endpoints fail or are under high load, use deterministic local engine
      const local = generateLocalAnalysis(quickAction, queryText, products || [], movements || []);
      return res.json({ response: local, source: "local-analysis" });
    } catch (error: any) {
      console.warn("Gemini service unavailable, serving instant local stock analysis.");
      const { quickAction, prompt, products, movements } = req.body;
      const fallback = generateLocalAnalysis(quickAction, prompt, products || [], movements || []);
      return res.json({ response: fallback, source: "local-fallback" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SmartStock Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateLocalAnalysis(actionKey: string | undefined, query: string | undefined, products: any[], movements: any[]): string {
  const totalItems = products.length;
  const totalUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const zeroStock = products.filter((p) => p.currentStock === 0);
  const lowStock = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock);
  const healthyStock = products.filter((p) => p.currentStock > p.minStock);
  const sorted = [...products].sort((a, b) => a.currentStock - b.currentStock);
  const lowest = sorted[0];

  const totalEntries = movements.filter((m) => m.type === "ENTRADA").reduce((s, m) => s + m.quantity, 0);
  const totalExits = movements.filter((m) => m.type === "SAIDA").reduce((s, m) => s + m.quantity, 0);

  if (actionKey === "ITENS_CRITICOS" || query?.toLowerCase().includes("crítico") || query?.toLowerCase().includes("baixo")) {
    let t = `### 🚨 ITENS EM SITUAÇÃO CRÍTICA E ALERTA\n\n`;
    if (zeroStock.length === 0 && lowStock.length === 0) {
      t += `✅ **Nenhum item crítico!** Todos os ${totalItems} produtos cadastrados possuem estoque acima do limite mínimo.\n`;
      return t;
    }
    let count = 1;
    if (zeroStock.length > 0) {
      zeroStock.forEach((p) => {
        t += `**${count++}. ${p.name}** (\`${p.code}\`)\n`;
        t += `- **Prioridade:** 🔴 MÁXIMA (Zerado)\n`;
        t += `- **Estoque Atual:** 0 ${p.unit} | **Mínimo:** ${p.minStock} ${p.unit}\n`;
        t += `- **Status:** Totalmente esgotado\n`;
        t += `- **Recomendação:** Reposição urgente necessária\n`;
        if (p.location) t += `- **Local:** ${p.location}\n`;
        t += `\n`;
      });
    }
    if (lowStock.length > 0) {
      lowStock.forEach((p) => {
        t += `**${count++}. ${p.name}** (\`${p.code}\`)\n`;
        t += `- **Prioridade:** ⚠️ ALTA (Estoque baixo)\n`;
        t += `- **Estoque Atual:** ${p.currentStock} ${p.unit} | **Mínimo:** ${p.minStock} ${p.unit}\n`;
        t += `- **Status:** Abaixo do nível mínimo\n`;
        t += `- **Recomendação:** Repor em breve para evitar ruptura\n`;
        if (p.category) t += `- **Categoria:** ${p.category}\n`;
        t += `\n`;
      });
    }
    return t;
  }

  if (actionKey === "SUGERIR_REPOSICAO" || query?.toLowerCase().includes("repor") || query?.toLowerCase().includes("reposição")) {
    const needRestock = [...zeroStock, ...lowStock];
    let t = `### 📦 SUGESTÃO DE PRIORIDADE PARA REPOSIÇÃO\n\n`;
    if (needRestock.length === 0) {
      t += `✅ O estoque está plenamente abastecido no momento. Nenhuma reposição emergencial é necessária.\n`;
      return t;
    }
    t += `Com base no estoque mínimo configurado, recomendamos os seguintes pedidos:\n\n`;
    needRestock.forEach((p, idx) => {
      const deficit = Math.max(0, p.minStock - p.currentStock);
      const suggestedOrder = deficit + Math.ceil(p.minStock * 0.5);
      t += `**${idx + 1}. ${p.name}** (\`${p.code}\`)\n`;
      t += `- **Prioridade:** ${p.currentStock === 0 ? "🔴 MÁXIMA (Zerado)" : "⚠️ ALTA (Abaixo do mínimo)"}\n`;
      t += `- **Estoque Atual:** ${p.currentStock} ${p.unit} | **Mínimo:** ${p.minStock} ${p.unit}\n`;
      t += `- **Status:** ${p.currentStock === 0 ? "Esgotado no estoque" : "Nível abaixo da margem de segurança"}\n`;
      t += `- **Recomendação:** Comprar +${suggestedOrder} ${p.unit} para operar com margem segura\n\n`;
    });
    return t;
  }

  if (actionKey === "RESUMO_MOVIMENTACOES" || query?.toLowerCase().includes("moviment") || query?.toLowerCase().includes("histórico")) {
    let t = `### 📊 RESUMO DAS MOVIMENTAÇÕES RECENTES\n\n`;
    t += `- **Total de Registros:** ${movements.length} operações realizadas\n`;
    t += `- **Total de Entradas:** +${totalEntries} unidades adicionadas\n`;
    t += `- **Total de Saídas:** -${totalExits} unidades expedidas\n\n`;
    if (movements.length > 0) {
      t += `**Últimas Atividades:**\n`;
      movements.slice(0, 5).forEach((m) => {
        const typeIcon = m.type === "ENTRADA" ? "📥 ENTRADA" : "📤 SAÍDA";
        const dateStr = new Date(m.timestamp).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        t += `- **${typeIcon}**: ${m.quantity}x **${m.productName}** (${m.productCode}) em ${dateStr}\n`;
      });
    } else {
      t += `*Nenhuma movimentação registrada até o momento.*`;
    }
    return t;
  }

  if (query?.toLowerCase().includes("menos unidade") || query?.toLowerCase().includes("menor")) {
    if (!lowest) return "Não existem dados suficientes no sistema para essa análise.";
    let t = `### 📉 PRODUTO COM MENOS UNIDADES\n\n`;
    t += `**1. ${lowest.name}** (\`${lowest.code}\`)\n`;
    t += `- **Prioridade:** ${lowest.currentStock === 0 ? "🔴 MÁXIMA (Zerado)" : lowest.currentStock <= lowest.minStock ? "⚠️ ALTA (Estoque baixo)" : "🟢 REGULAR"}\n`;
    t += `- **Estoque Atual:** ${lowest.currentStock} ${lowest.unit} | **Mínimo:** ${lowest.minStock} ${lowest.unit}\n`;
    t += `- **Status:** ${lowest.currentStock === 0 ? "Totalmente esgotado" : lowest.currentStock <= lowest.minStock ? "Abaixo do nível mínimo" : "Regular"}\n`;
    t += `- **Recomendação:** ${lowest.currentStock <= lowest.minStock ? "Reposição prioritária recomendada" : "Estoque dentro dos parâmetros"}\n`;
    if (lowest.location) t += `- **Local:** ${lowest.location}\n`;
    return t;
  }

  let t = `### 📋 ANÁLISE GERAL DO ESTOQUE SMARTSTOCK\n\n`;
  t += `- **Total de Produtos Cadastrados:** ${totalItems} itens\n`;
  t += `- **Volume Total Armazenado:** ${totalUnits} unidades totais\n`;
  t += `- **Itens em Nível Seguro:** ${healthyStock.length} produtos\n`;
  t += `- **Itens em Alerta de Estoque Baixo:** ${lowStock.length} produtos\n`;
  t += `- **Itens com Estoque Zerado:** ${zeroStock.length} produtos\n\n`;
  if (zeroStock.length > 0 || lowStock.length > 0) {
    t += `**Recomendação Imediata:** Verificar reposição para os ${zeroStock.length + lowStock.length} itens que demandam atenção.`;
  } else {
    t += `**Status Operacional:** O inventário está balanceado e todas as mercadorias atendem ao estoque de segurança.`;
  }
  return t;
}

startServer();
