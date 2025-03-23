from flask import Flask, request, jsonify
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

model = SentenceTransformer("all-MiniLM-L6-v2")

def load_data(filename="restaurants.json"):
    with open(filename, "r") as f:
        return json.load(f)

def restaurant_to_text(restaurant):
    fields = [
        restaurant.get("name", ""),
        f"Cuisines: {', '.join(restaurant.get('cuisines', []))}",
        f"Location: {restaurant.get('street_address', '')}, {restaurant.get('city', '')}, {restaurant.get('state', '')}, ZIP: {restaurant.get('zipcode', '')}",
        f"Rating: {restaurant.get('rating', 'N/A')} ({restaurant.get('review_count', '0')} reviews)",
        f"Pricing: {restaurant.get('price', 'Unknown')}",
        f"Tags: {', '.join(restaurant.get('tags', []))}",
        f"Description: {restaurant.get('description', 'No description available')}",
        f"Endorsement: {restaurant.get('endorsement_copy', 'N/A')}",
        f"Website: {restaurant.get('restaurant_url', 'N/A')}",
    ]
    return " | ".join([f for f in fields if f])

def get_embedding(text):
    return model.encode(text)

def build_index(data):
    embeddings = []
    descriptions = []
    
    for restaurant in data:
        desc = restaurant_to_text(restaurant)
        descriptions.append({"name": restaurant["name"], "desc": desc, "data": restaurant})
        embeddings.append(get_embedding(desc))

    embedding_dim = len(embeddings[0])
    index = faiss.IndexFlatL2(embedding_dim)
    index.add(np.array(embeddings))

    return index, descriptions

def search_restaurant(query, index, descriptions, top_k=3):
    query_embedding = get_embedding(query).reshape(1, -1)
    _, idxs = index.search(query_embedding, top_k)
    
    return [descriptions[i] for i in idxs[0]]

data = load_data()
index, descriptions = build_index(data)

@app.route("/ask", methods=["GET"])
def ask():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    matches = search_restaurant(query, index, descriptions)
    
    response = []
    for match in matches:
        restaurant = match["data"]
        response.append({
            "name": restaurant["name"],
            "cuisines": restaurant.get("cuisines", []),
            "location": {
                "street_address": restaurant.get("street_address", "Unknown"),
                "city": restaurant.get("city", "Unknown"),
                "state": restaurant.get("state", "Unknown"),
                "zipcode": restaurant.get("zipcode", "Unknown"),
            },
            "rating": restaurant.get("rating", "N/A"),
            "review_count": restaurant.get("review_count", "0"),
            "price": restaurant.get("price", "Unknown"),
            "tags": restaurant.get("tags", []),
            "description": restaurant.get("description", "No description available"),
            "endorsement": restaurant.get("endorsement_copy", "N/A"),
            "website": restaurant.get("restaurant_url", "N/A"),
        })

    return jsonify({"query": query, "results": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8081, debug=True)