import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { motion } from "framer-motion";

interface Message {
  user: "You" | "Bot";
  text: string | JSX.Element;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const sendMessage = async () => {
    if (!query.trim()) return;
    if (!showChat) setShowChat(true);
    
    const userMessage: Message = { user: "You", text: query };
    setMessages([...messages, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      setLoading(false);

      if (!data) {
        setMessages((prev) => [...prev, { user: "Bot", text: "No restaurants found! 🍽️" }]);
        return;
      }

      console.log(data.results[0])

      if (data.results?.length) {
        const restaurantList = (
          <div className="space-y-6 py-4 flex flex-col items-center">
            {data.results.map((r: any) => (
              <div 
                key={r.name} 
                className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg border border-gray-700 transition-transform transform hover:scale-105 p-5 w-full max-w-lg text-center"
              >
                <h3 className="text-xl font-extrabold text-white flex flex-col items-center">
                  🍽️ {r.name}
                  {r.price && <span className="text-green-400 text-lg">{'💲'.repeat(r.price)}</span>}
                </h3>
      
                <p className="text-gray-400 text-sm mt-1">
                  📍 {r.location.city}, {r.location.state}
                </p>
      
                {r.rating && (
                  <p className="mt-2 text-yellow-400 font-medium">
                    ⭐ {r.rating} <span className="text-gray-300">({r.review_count} reviews)</span>
                  </p>
                )}
      
                {r.website && (
                  <a
                    href={r.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-blue-400 hover:text-blue-300 font-semibold transition duration-200"
                  >
                    🔗 Visit Website
                  </a>
                )}
      
                {r.endorsement && (
                  <p className="mt-2 text-gray-300 text-sm leading-relaxed">
                    📝 {r.endorsement}
                  </p>
                )}
              </div>
            ))}
          </div>
        );
      
        setMessages((prev) => [...prev, { user: "Bot", text: restaurantList }]);
      }         
       else if (data.answer) {
        setMessages((prev) => [...prev, { user: "Bot", text: data.answer }]);
      }
    } catch (error) {
      setLoading(false);
      console.error("Error:", error);
      setMessages((prev) => [...prev, { user: "Bot", text: "⚠️ Error fetching results" }]);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center bg-gradient-to-b from-gray-900 to-gray-800 text-white"
    style={{ backgroundImage: "url('/background.jpg')" }}>
      {/* Header */}
      {/* <div className="text-5xl font-extrabold text-center py-6 bg-gradient-to-r from-teal-400 to-indigo-600 text-white shadow-2xl tracking-wide transform transition-all duration-300 ease-in-out w-screen mx-0 px-0 flex items-center justify-center space-x-4">
  <img src="/zeal.jpeg" alt="Zeal AI Logo" className="h-12 w-12 object-contain" />
  <span>Zeal AI</span>
</div> */}
<motion.div 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }} 
  className={`flex items-center ${showChat ? "justify-start space-x-4" : "flex-col text-center"}`}
>
  {/* Logo Image */}
  <img 
    src="/zeal.jpeg" 
    alt="Zeal AI Logo" 
    className={`transition-all duration-300 ${showChat ? "w-12 h-12" : "w-24 h-24 mb-3 rounded-full shadow-lg"}`} 
  />

  {/* Text */}
  <div>
    <h1 className="text-4xl font-bold">Zeal AI</h1>
    {!showChat && <p className="text-gray-500 mt-2">Ask me about restaurants!</p>}
  </div>
</motion.div>


      {/* Chat Area */}
      {showChat && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col flex-grow w-full max-w-3xl h-[70vh] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700 mt-4"
        >
            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.user === "You" ? "justify-end" : "justify-start"}`}>
                <div className={`p-4 rounded-xl max-w-md text-sm font-medium shadow-md ${msg.user === "You" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-200"}`}>
                    {msg.text}
                </div>
                </div>
            ))}

            {/* Dynamic Assistant Response */}
            {query && !loading && (
                <div className="text-center text-gray-400 italic">
                {query.includes("best") ? "🔍 Finding top-rated restaurants..." 
                    : query.includes("cheap") ? "💰 Looking for budget-friendly options..." 
                    : "🍽️ Searching for delicious restaurants..."}
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div className="text-center text-yellow-400 font-semibold">⏳ Searching for the best match...</div>
            )}
            </div>
        </motion.div>
        )}

      {/* Input Bar */}
      <div className="w-full max-w-3xl p-4">
        <div className="flex border-t border-gray-700 pt-3">
          <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
            className="flex-grow p-3 text-lg border rounded-l-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-400" 
            placeholder="Ask about restaurants..."
          />
          <button onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600 text-white px-6 text-lg rounded-r-lg transition-all mx-2">
            <FaPaperPlane />
          </button>
          <button  className="bg-gray-300 p-2 rounded-full hover:bg-gray-400 transition">
            🎤
            </button>
        </div>
      </div>
    </div>
  );
}
