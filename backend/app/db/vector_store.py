import numpy as np
from typing import List, Dict, Any, Optional

class FaceVectorStore:
    """
    In-memory vector store with cosine similarity index to detect duplicate faces 
    linked across multiple different names or document numbers (Identity Graph).
    """
    def __init__(self, dimension: int = 512):
        self.dimension = dimension
        self.vectors: List[np.ndarray] = []
        self.metadata: List[Dict[str, Any]] = []

    def add_identity(self, embedding: List[float], metadata: Dict[str, Any]):
        vec = np.array(embedding, dtype=np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        self.vectors.append(vec)
        self.metadata.append(metadata)

    def search_duplicates(self, embedding: List[float], threshold: float = 0.82, top_k: int = 5) -> List[Dict[str, Any]]:
        if not self.vectors:
            return []
        
        query_vec = np.array(embedding, dtype=np.float32)
        norm = np.linalg.norm(query_vec)
        if norm > 0:
            query_vec = query_vec / norm
        
        matrix = np.array(self.vectors)
        similarities = np.dot(matrix, query_vec)
        
        results = []
        for idx in range(len(similarities)):
            score = float(similarities[idx])
            if score >= threshold:
                item = self.metadata[idx].copy()
                item["similarity_score"] = round(score, 4)
                results.append(item)
        
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

# Global singleton
face_vector_store = FaceVectorStore()
