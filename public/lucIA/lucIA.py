import json
import os
import time
import pickle
import random
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Any

# Load environment variables from .env file if it exists
def load_env_file():
    """Load environment variables from .env file"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value
        print("✅ Environment variables loaded from .env file")

# Load environment variables at module import
load_env_file()

# Verificar e instalar dependencias
try:
    import requests
    from requests.exceptions import RequestException, Timeout
except ImportError:
    print("📦 Installing 'requests' library...")
    os.system("pip install requests")
    import requests
    from requests.exceptions import RequestException, Timeout

class LucIA:
    """
    LucIA - A comprehensive conversational AI system with external API integration
    and local learning capabilities.
    """
    def __init__(self, learning_folder: str = "lucia_learning"):
        self.name = "LucIA"
        self.learning_folder = learning_folder
        self.conversation_history: List[Dict[str, Any]] = []
        self.knowledge_base: Dict[str, List[Dict[str, Any]]] = {}
        self.api_configs: Dict[str, Dict[str, Any]] = {}
        self.api_usage_count: defaultdict[str, int] = defaultdict(int)
        self.api_limits: Dict[str, int] = {}

        # Create learning folder if it doesn't exist
        if not os.path.exists(learning_folder):
            os.makedirs(learning_folder)
            print(f"📁 Learning folder created: {learning_folder}")

        # Load existing data
        self.load_knowledge_base()

    def configure_api(self, api_name: str, api_key: str, endpoint: str, daily_limit: int = 1000):
        """
        Configures an external API for LucIA to use.

        Args:
            api_name (str): The name of the API (e.g., "openai", "anthropic").
            api_key (str): The API key for authentication.
            endpoint (str): The API endpoint URL.
            daily_limit (int): The maximum number of daily requests allowed for this API.
        """
        self.api_configs[api_name] = {
            'api_key': api_key,
            'endpoint': endpoint,
            'daily_limit': daily_limit
        }
        self.api_limits[api_name] = daily_limit
        self.api_usage_count[api_name] = 0 # Initialize usage count for the day
        print(f"✅ API {api_name} configured with a daily limit of {daily_limit} queries.")

    def add_openai_api(self, api_key: str):
        """
        Configures the OpenAI API.

        Args:
            api_key (str): 
        """
        self.configure_api(
            "openai",
            api_key,
            "https://api.openai.com/v1/chat/completions",
            1000 # Default daily limit for OpenAI


        )

    def add_anthropic_api(self, api_key: str):
        """
        Configures the Anthropic API.

        Args:
            api_key (str): Your Anthropic API key.
        """
        self.configure_api(
            "anthropic",
            api_key,
            "https://api.anthropic.com/v1/messages",
            1000 # Default daily limit for Anthropic
        )

    def add_gemini_api(self, api_key: str):
        """
        Configures the Google Gemini API.

        Args:
            api_key (str): Your Google Gemini API key.
        """
        self.configure_api(
            "gemini",
            api_key,
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            1000 # Default daily limit for Gemini
        )

    def add_huggingface_api(self, api_key: str, model_endpoint: str = "microsoft/DialoGPT-large"):
        """
        Configures the Hugging Face API.

        Args:
            api_key (str): Your Hugging Face API key.
            model_endpoint (str): The specific model endpoint to use (e.g., "microsoft/DialoGPT-large").
        """
        self.configure_api(
            "huggingface",
            api_key,
            f"https://api-inference.huggingface.co/models/{model_endpoint}",
            2000 # Default daily limit for Hugging Face
        )
    
    def add_cohere_api(self, api_key: str):
        """Configura Cohere API"""
        self.configure_api(
            "cohere",
            api_key,
            "https://api.cohere.ai/v1/generate",
            1000
        )

    def _call_api(self, api_name: str, prompt: str) -> Optional[str]:
        """
        Internal method to call a configured external API.

        Args:
            api_name (str): The name of the API to call.
            prompt (str): The prompt to send to the API.

        Returns:
            Optional[str]: The API's response text, or None if the call fails or limit is reached.
        """
        config = self.api_configs.get(api_name)
        if not config:
            print(f"❌ API '{api_name}' is not configured.")
            return None

        if self.api_usage_count[api_name] >= self.api_limits[api_name]:
            print(f"⚠️ Daily limit for {api_name} reached.")
            return None

        headers = {}
        data: Dict[str, Any] = {}
        endpoint = config['endpoint']
        
        # API-specific payload and headers
        if api_name == "openai":
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            data = {
                "model": "gpt-3.5-turbo", # Consider making model configurable
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 1000,
                "temperature": 0.7
            }
        elif api_name == "anthropic":
            headers = {
                "x-api-key": config['api_key'],
                "Content-Type": "application/json",
                "anthropic-version": "2023-06-01"
            }
            data = {
                "model": "claude-3-sonnet-20240229", # Consider making model configurable
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}]
            }
        elif api_name == "gemini":
            endpoint = f"{config['endpoint']}?key={config['api_key']}" # API key in URL for Gemini
            data = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1000
                }
            }
        elif api_name == "huggingface":
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            data = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 1000,
                    "temperature": 0.7,
                    "return_full_text": False
                }
            }
        elif api_name == "cohere":
            headers = {
                "Authorization": f"Bearer {config['api_key']}",
                "Content-Type": "application/json"
            }
            data = {
                "prompt": prompt,
                "model": "command", # Or "command-light", etc.
                "max_tokens": 1000,
                "temperature": 0.7,
                "return_likelihoods": "NONE"
            }
        else:
            print(f"❌ API '{api_name}' has no defined calling mechanism.")
            return None

        try:
            print(f"📡 Consulting {api_name}...")
            if api_name == "gemini": # Gemini handles key in URL, not header
                response = requests.post(endpoint, json=data, timeout=30)
            else:
                response = requests.post(endpoint, headers=headers, json=data, timeout=30)

            response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)
            result = response.json()

            # Extract response based on API
            if api_name == "openai":
                if 'choices' in result and len(result['choices']) > 0:
                    api_response = result['choices'][0]['message']['content']
                else:
                    raise ValueError(f"Unexpected OpenAI response structure: {result}")
            elif api_name == "anthropic":
                if 'content' in result and len(result['content']) > 0:
                    api_response = result['content'][0]['text']
                else:
                    raise ValueError(f"Unexpected Anthropic response structure: {result}")
            elif api_name == "gemini":
                if 'candidates' in result and len(result['candidates']) > 0:
                    api_response = result['candidates'][0]['content']['parts'][0]['text']
                else:
                    raise ValueError(f"Unexpected Gemini response structure: {result}")
            elif api_name == "huggingface":
                if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
                    api_response = result[0]['generated_text']
                else:
                    raise ValueError(f"Unexpected Hugging Face response structure: {result}")
            elif api_name == "cohere":
                if 'generations' in result and len(result['generations']) > 0 and 'text' in result['generations'][0]:
                    api_response = result['generations'][0]['text']
                else:
                    raise ValueError(f"Unexpected Cohere response structure: {result}")
            else:
                raise NotImplementedError(f"Response parsing not implemented for API: {api_name}")

            self.api_usage_count[api_name] += 1
            return api_response

        except Timeout:
            print(f"❌ Timeout calling {api_name} API. The request took too long.")
            return None
        except RequestException as e:
            print(f"❌ Network or HTTP error calling {api_name} API: {e}")
            if response is not None:
                print(f"   Response status: {response.status_code}")
                print(f"   Response body: {response.text}")
            return None
        except json.JSONDecodeError:
            print(f"❌ Error decoding JSON response from {api_name} API.")
            return None
        except (KeyError, IndexError, ValueError, NotImplementedError) as e:
            print(f"❌ Error parsing {api_name} API response: {e}")
            return None
        except Exception as e:
            print(f"❌ An unexpected error occurred while calling {api_name} API: {e}")
            return None

    def get_external_response(self, prompt: str) -> Optional[str]:
        """
        Attempts to get a response from configured external APIs based on priority.

        Args:
            prompt (str): The user's input prompt.

        Returns:
            Optional[str]: The response from an external API, or None if no API provides one.
        """
        # Prioritize APIs (you can change the order)
        apis_to_try = ["openai", "anthropic", "gemini", "huggingface", "cohere"]
        
        for api_name in apis_to_try:
            if api_name in self.api_configs:
                response = self._call_api(api_name, prompt)
                if response:
                    # Save the response for learning
                    self.save_learning_data(prompt, response, api_name)
                    return response
        return None

    def save_learning_data(self, prompt: str, response: str, source: str):
        """
        Saves learning data (prompt, response, source) to a JSON file.

        Args:
            prompt (str): The user's input.
            response (str): LucIA's response.
            source (str): The source of the response (e.g., "openai", "local").
        """
        learning_data = {
            "timestamp": datetime.now().isoformat(),
            "prompt": prompt,
            "response": response,
            "source": source,
            "prompt_length": len(prompt),
            "response_length": len(response)
        }

        # Save to a daily JSON file
        filename = os.path.join(self.learning_folder, f"learning_{datetime.now().strftime('%Y%m%d')}.json")

        existing_data = []
        if os.path.exists(filename):
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    existing_data = json.load(f)
            except json.JSONDecodeError:
                print(f"⚠️ Could not decode existing JSON from {filename}. Starting fresh for today.")
                existing_data = []
            except Exception as e:
                print(f"❌ Error reading existing learning data from {filename}: {e}")
                existing_data = []

        existing_data.append(learning_data)

        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(existing_data, f, ensure_ascii=False, indent=2)
            print(f"💾 Data saved to {filename}")
        except Exception as e:
            print(f"❌ Error saving learning data to {filename}: {e}")

        # Update local knowledge base
        self.update_knowledge_base(prompt, response)

    def update_knowledge_base(self, prompt: str, response: str):
        """
        Updates the local knowledge base with a new prompt-response pair.

        Args:
            prompt (str): The user's input.
            response (str): LucIA's response.
        """
        keywords = self.extract_keywords(prompt)
        # Use a consistent key for similar prompts. If no keywords, use a generic key.
        key = "_".join(sorted(keywords[:3])) if keywords else "general_knowledge"

        if key not in self.knowledge_base:
            self.knowledge_base[key] = []

        self.knowledge_base[key].append({
            "prompt": prompt,
            "response": response,
            "timestamp": datetime.now().isoformat()
        })

        # Limit to 10 responses per key to prevent excessive growth
        if len(self.knowledge_base[key]) > 10:
            self.knowledge_base[key] = self.knowledge_base[key][-10:]

        self.save_knowledge_base()

    def extract_keywords(self, text: str) -> List[str]:
        """
        Extracts basic keywords from text, ignoring common stop words and punctuation.

        Args:
            text (str): The input text.

        Returns:
            List[str]: A list of extracted keywords.
        """
        # Common Spanish stop words (expanded list for better filtering)
        stop_words = {
            "el", "la", "los", "las", "un", "una", "unos", "unas",
            "de", "a", "ante", "bajo", "cabe", "con", "contra", "de", "desde",
            "en", "entre", "hacia", "hasta", "para", "por", "según", "sin",
            "so", "sobre", "tras", "durante", "mediante", "vs", "vía",
            "y", "e", "ni", "o", "u", "pero", "mas", "sino", "aunque",
            "que", "quien", "quienes", "cual", "cuales", "donde", "cuando", "como", "cuanto",
            "es", "ser", "estar", "haber", "hacer", "tener", "decir", "ir", "ver", "dar",
            "mi", "tu", "su", "nuestro", "vuestro", "sus", "mis", "tus", "sus",
            "me", "te", "se", "nos", "os", "le", "les", "lo", "la", "los", "las",
            "si", "no", "bien", "mal", "muy", "más", "menos", "ya", "aún", "todavía",
            "siempre", "nunca", "jamás", "quizás", "tal", "vez", "casi", "solo", "solamente",
            "incluso", "además", "aquí", "allí", "ahí", "cerca", "lejos", "dentro", "fuera",
            "ayer", "hoy", "mañana", "antes", "después", "pronto", "tarde", "a menudo", "a veces",
            "mucho", "poco", "demasiado", "bastante", "todo", "nada", "algo", "alguien", "nadie"
        }

        words = text.lower().split()
        # Remove punctuation and filter stop words and short words
        keywords = [
            word.strip(".,!?;:()[]{}'\"")
            for word in words
            if word.strip(".,!?;:()[]{}'\"") and word.strip(".,!?;:()[]{}'\"") not in stop_words and len(word.strip(".,!?;:()[]{}'\"")) > 2
        ]
        return keywords

    def find_local_response(self, prompt: str) -> Optional[str]:
        """
        Searches for a similar response in the local knowledge base.

        Args:
            prompt (str): The user's input prompt.

        Returns:
            Optional[str]: A matching response from the local knowledge base, or None.
        """
        input_keywords = set(self.extract_keywords(prompt))
        
        best_match_response = None
        best_score = 0.0

        if not input_keywords: # If no meaningful keywords in prompt, can't match
            return None

        for key, entries in self.knowledge_base.items():
            kb_keywords = set(key.split("_")) # Key is already based on keywords
            
            # Calculate Jaccard similarity or a similar metric
            if not kb_keywords:
                continue

            intersection = len(input_keywords.intersection(kb_keywords))
            union = len(input_keywords.union(kb_keywords))
            
            score = intersection / union if union > 0 else 0.0

            if score > best_score and score >= 0.2:  # Tunable similarity threshold
                best_score = score
                # Select a random response from the entries for the best-matching key
                best_match_response = random.choice(entries)["response"]
                
        return best_match_response

    def generate_local_response(self, prompt: str) -> str:
        """
        Generates a response using only local knowledge.

        Args:
            prompt (str): The user's input prompt.

        Returns:
            str: LucIA's response based on local knowledge.
        """
        local_response = self.find_local_response(prompt)

        if local_response:
            return f"🧠 [Local Knowledge] {local_response}"
        else:
            return (f"🤔 [LucIA] I'm sorry, I don't have enough information on "
                    f"'{prompt}' in my local knowledge base. I need more training data "
                    f"to answer this type of query better.")

    def chat(self, prompt: str) -> str:
        """
        Main chat function for LucIA. Processes user input and provides a response.

        Args:
            prompt (str): The user's input message.

        Returns:
            str: LucIA's generated response.
        """
        print(f"\n🤖 {self.name}: Processing your query...")

        # Add to conversation history
        self.conversation_history.append({
            "user": prompt,
            "timestamp": datetime.now().isoformat()
        })

        # Try to get a response from external APIs first
        response = self.get_external_response(prompt)

        if response:
            print(f"📡 Response obtained from external API.")
            self.conversation_history[-1]["lucia_response"] = response
            self.conversation_history[-1]["source"] = "external_api"
            return response
        else:
            print(f"🏠 APIs exhausted or unavailable, using local knowledge.")
            local_response = self.generate_local_response(prompt)
            self.conversation_history[-1]["lucia_response"] = local_response
            self.conversation_history[-1]["source"] = "local"
            return local_response

    def save_knowledge_base(self):
        """Saves the knowledge base to a pickle file."""
        filepath = os.path.join(self.learning_folder, "knowledge_base.pkl")
        try:
            with open(filepath, 'wb') as f:
                pickle.dump(self.knowledge_base, f)
            print(f"💾 Knowledge base saved to {filepath}")
        except Exception as e:
            print(f"❌ Error saving knowledge base to {filepath}: {e}")

    def load_knowledge_base(self):
        """Loads the knowledge base from a pickle file."""
        filepath = os.path.join(self.learning_folder, "knowledge_base.pkl")
        if os.path.exists(filepath):
            try:
                with open(filepath, 'rb') as f:
                    self.knowledge_base = pickle.load(f)
                print(f"📚 Knowledge base loaded: {len(self.knowledge_base)} categories.")
            except (EOFError, pickle.UnpicklingError) as e:
                print(f"⚠️ Error loading knowledge base (corrupted file?): {e}. Starting with an empty knowledge base.")
                self.knowledge_base = {}
            except Exception as e:
                print(f"⚠️ Error loading knowledge base from {filepath}: {e}. Starting with an empty knowledge base.")
                self.knowledge_base = {}
        else:
            print(f"📚 No existing knowledge base found at {filepath}. Starting fresh.")
            self.knowledge_base = {}

    def get_learning_stats(self) -> Dict[str, Any]:
        """
        Retrieves learning statistics for LucIA.

        Returns:
            Dict[str, Any]: A dictionary containing various statistics.
        """
        total_entries = sum(len(entries) for entries in self.knowledge_base.values())
        api_usage = dict(self.api_usage_count)

        return {
            "total_knowledge_entries": total_entries,
            "knowledge_categories": len(self.knowledge_base),
            "api_usage": api_usage,
            "conversation_history_length": len(self.conversation_history)
        }

    def reset_daily_limits(self):
        """Resets the daily API usage counts."""
        for api_name in self.api_usage_count:
            self.api_usage_count[api_name] = 0
        print("🔄 Daily API limits reset.")

def configure_lucia() -> LucIA:
    """
    Configures LucIA with necessary API keys and initializes the system.
    """
    print("🚀 Configuring LucIA...")
    
    lucia = LucIA()
    
    # IMPORTANT: Use environment variables for API keys for security
    # Set your API key as an environment variable: OPENAI_API_KEY=your_key_here
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        lucia.add_openai_api(openai_api_key)
        print("✅ OpenAI API configured from environment variable")
    else:
        print("⚠️ OpenAI API key not found in environment variables")
        print("   Set OPENAI_API_KEY environment variable to use OpenAI features")
    
    # Add other APIs if you have keys for them. Example:
    # anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    # if anthropic_api_key:
    #     lucia.add_anthropic_api(anthropic_api_key)
    # gemini_api_key = os.getenv("GEMINI_API_KEY")
    # if gemini_api_key:
    #     lucia.add_gemini_api(gemini_api_key)
    # huggingface_api_key = os.getenv("HUGGINGFACE_API_KEY")
    # if huggingface_api_key:
    #     lucia.add_huggingface_api(huggingface_api_key)
    # cohere_api_key = os.getenv("COHERE_API_KEY")
    # if cohere_api_key:
    #     lucia.add_cohere_api(cohere_api_key)

    print("✅ LucIA configured successfully.")
    return lucia

def display_statistics(lucia: LucIA):
    """
    Displays detailed learning and API usage statistics for LucIA.

    Args:
        lucia (LucIA): The LucIA instance.
    """
    stats = lucia.get_learning_stats()
    
    print("\n" + "=" * 40)
    print("📊 LUCIA STATISTICS")
    print("=" * 40)
    print(f"🧠 Total Knowledge Entries: {stats['total_knowledge_entries']}")
    print(f"📂 Knowledge Categories: {stats['knowledge_categories']}")
    print(f"💬 Conversation History Length: {stats['conversation_history_length']}")
    
    print(f"\n🔌 API Usage:")
    if not stats['api_usage']:
        print("    No API usage recorded yet.")
    for api, count in stats['api_usage'].items():
        limit = lucia.api_limits.get(api, 0)
        percentage = (count / limit * 100) if limit > 0 else 0
        print(f"    • {api.capitalize()}: {count}/{limit} used ({percentage:.1f}%)")
        
    print("=" * 40)

def display_api_status(lucia: LucIA):
    """
    Displays the current status of all configured APIs.

    Args:
        lucia (LucIA): The LucIA instance.
    """
    print("\n" + "=" * 40)
    print("🔌 API STATUS")
    print("=" * 40)
    
    if not lucia.api_configs:
        print("❌ No APIs configured.")
        return
        
    for api_name, config in lucia.api_configs.items():
        used = lucia.api_usage_count.get(api_name, 0)
        limit = lucia.api_limits.get(api_name, 0)
        remaining = limit - used
        status = "🟢 Available" if remaining > 0 else "🔴 Exhausted"
        
        print(f"{status} {api_name.capitalize()}")
        print(f"    └── {used}/{limit} used ({remaining} remaining)")
        
    print("=" * 40)

def main():
    """Main function to run the LucIA conversational AI."""
    print("=" * 60)
    print("🚀 LUCIA - CONVERSATIONAL AI")
    print("Intelligent Learning System")
    print("=" * 60)
    
    # Configure LucIA
    lucia = configure_lucia()
    
    # Display initial information
    print(f"\n📋 Information:")
    print(f"    • Configured APIs: {len(lucia.api_configs)}")
    print(f"    • Learning Folder: {lucia.learning_folder}")
    print(f"    • Knowledge Base Categories: {len(lucia.knowledge_base)}")
    
    print("\n💬 Available Commands:")
    print("    • 'exit' / 'salir' / 'quit' - End conversation")
    print("    • 'stats' - View statistics")
    print("    • 'apis' - View API status")
    print("    • 'reset' - Reset daily API limits")
    
    print("\n" + "=" * 60)
    print("Hello! I'm LucIA 🤖")
    print("I can use powerful AI models and learn from our conversations.")
    print("How can I help you today?")
    print("=" * 60)
    
    # Main conversation loop
    while True:
        try:
            user_input = input("\n👤 You: ").strip()
            
            if not user_input:
                continue
                
            # Special commands
            if user_input.lower() in ['salir', 'exit', 'quit']:
                print("\n👋 Goodbye! Thanks for teaching me so much.")
                print(f"📚 I have learned from {len(lucia.conversation_history)} conversations.")
                break
                
            elif user_input.lower() == 'stats':
                display_statistics(lucia)
                continue
                
            elif user_input.lower() == 'apis':
                display_api_status(lucia)
                continue
                
            elif user_input.lower() == 'reset':
                lucia.reset_daily_limits()
                continue
            
            # Process normal question
            response = lucia.chat(user_input)
            print(f"\n🤖 LucIA: {response}")
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ An unexpected error occurred in the main loop: {e}")
            print("Please try again...")

if __name__ == "__main__":
    main()