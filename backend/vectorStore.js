import { pipeline } from "@xenova/transformers";
import crypto from "crypto";

let knowledgeBase = [];
let uploadedDocuments = []; // Array of { id, filename }
let extractor = null;

export async function initExtractor() {
    if (!extractor) {
        console.log("Loading embedding model...");
        extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
            quantized: true, // smaller model footprint
        });
        console.log("Embedding model loaded.");
    }
    return extractor;
}

export async function getEmbedding(text) {
    const extract = await initExtractor();
    const output = await extract(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
}

export async function addDocumentChunks(chunks, filename) {
    console.log(`Processing ${chunks.length} chunks for ${filename}...`);
    
    // Generate a unique ID for the document
    const docId = crypto.randomUUID();
    
    // Track the document
    uploadedDocuments.push({ id: docId, filename });

    for (const chunk of chunks) {
        if (!chunk || chunk.trim().length === 0) continue;
        const embedding = await getEmbedding(chunk);
        knowledgeBase.push({
            docId: docId,
            text: chunk,
            embedding: embedding
        });
    }
    console.log(`Added chunks for ${filename}. Total chunks: ${knowledgeBase.length}`);
    return docId;
}

export function getDocuments() {
    return uploadedDocuments;
}

export function deleteDocument(docId) {
    const beforeCount = knowledgeBase.length;
    // Remove chunks belonging to this document
    knowledgeBase = knowledgeBase.filter(item => item.docId !== docId);
    
    // Remove document from tracking list
    uploadedDocuments = uploadedDocuments.filter(doc => doc.id !== docId);
    
    const afterCount = knowledgeBase.length;
    console.log(`Deleted document ${docId}. Removed ${beforeCount - afterCount} chunks.`);
}

export function clearKnowledgeBase() {
    knowledgeBase = [];
    uploadedDocuments = [];
    console.log("Knowledge base cleared.");
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function searchSimilar(queryText, topK = 3) {
    if (knowledgeBase.length === 0) {
        return [];
    }
    
    const queryEmbedding = await getEmbedding(queryText);
    
    const results = knowledgeBase.map(item => ({
        text: item.text,
        similarity: cosineSimilarity(queryEmbedding, item.embedding)
    }));
    
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, topK).map(r => r.text);
}
