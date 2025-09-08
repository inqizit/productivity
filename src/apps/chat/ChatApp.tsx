import React, { useState, useEffect, useRef } from 'react';
import { pipeline, PipelineType } from '@xenova/transformers';
import { chatStorage, ChatMessage, ChatConversation } from '../../utils/storage/AppStorage';
import './ChatApp.css';

interface ModelInfo {
  id: string;
  name: string;
  size: string;
  description: string;
  type: PipelineType;
  modelId: string;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'test',
    name: 'Test Mode',
    size: '~0MB',
    description: 'Echo responses for testing (no AI model)',
    type: 'text-generation' as PipelineType,
    modelId: 'test-mode'
  },
  {
    id: 'distilgpt2',
    name: 'DistilGPT-2 Tiny',
    size: '~50MB',
    description: 'Ultra-light model, fast responses',
    type: 'text-generation' as PipelineType,
    modelId: 'Xenova/distilgpt2'
  },
  {
    id: 'gpt2-tiny',
    name: 'GPT-2 Nano', 
    size: '~80MB',
    description: 'Small but capable text generation',
    type: 'text-generation' as PipelineType,
    modelId: 'Xenova/gpt2'
  }
];

type ChatState = 'idle' | 'loading_model' | 'generating' | 'error';

const ChatApp: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatState, setChatState] = useState<ChatState>('idle');
  const [selectedModel, setSelectedModel] = useState<ModelInfo>(AVAILABLE_MODELS[0]); // Test mode as default
  const [loadedModel, setLoadedModel] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modelProgress, setModelProgress] = useState<{ progress: number; message: string }>({ progress: 0, message: '' });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pipelineRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize storage and load conversations
  useEffect(() => {
    const initializeChat = async () => {
      try {
        await chatStorage.initialize();
        await loadConversations();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setError('Failed to initialize chat storage');
      }
    };

    initializeChat();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const convs = await chatStorage.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const msgs = await chatStorage.getMessages(conversationId);
      setMessages(msgs);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('Failed to load conversation');
    }
  };

  const createNewConversation = async () => {
    try {
      const title = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      const conversationId = await chatStorage.createConversation(title);
      
      await loadConversations();
      setCurrentConversationId(conversationId);
      setMessages([]);
      setInputMessage('');
      setError('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create new conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await chatStorage.deleteConversation(conversationId);
      await loadConversations();
      
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const loadModel = async (model: ModelInfo) => {
    if (loadedModel === model.id && pipelineRef.current) {
      return; // Model already loaded
    }

    try {
      setChatState('loading_model');
      setError('');
      setModelProgress({ progress: 0, message: `Loading ${model.name}...` });

      // Clean up previous model
      if (pipelineRef.current) {
        pipelineRef.current = null;
      }

      // Handle test mode
      if (model.id === 'test') {
        pipelineRef.current = 'test-mode';
        setLoadedModel(model.id);
        setChatState('idle');
        setModelProgress({ progress: 100, message: `${model.name} ready!` });
        console.log(`✅ Test mode activated`);
        return;
      }

      // Create abort controller for this loading session
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Load the model with progress tracking and timeout
      const modelPipeline = await Promise.race([
        pipeline(model.type, model.modelId, {
          progress_callback: (progress: any) => {
            if (progress.status === 'downloading') {
              const percent = Math.round((progress.loaded / progress.total) * 100);
              setModelProgress({
                progress: percent,
                message: `Downloading ${model.name}: ${percent}%`
              });
            } else if (progress.status === 'loading') {
              setModelProgress({
                progress: 100,
                message: `Loading ${model.name} into memory...`
              });
            }
          },
          device: 'auto',
          quantized: true,
          revision: 'main'
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Model loading timeout after 2 minutes')), 120000)
        )
      ]);

      // Check if loading was aborted
      if (abortController.signal.aborted) {
        return;
      }

      pipelineRef.current = modelPipeline;
      setLoadedModel(model.id);
      setChatState('idle');
      setModelProgress({ progress: 100, message: `${model.name} ready!` });

      console.log(`✅ Model ${model.name} loaded successfully`);
    } catch (error: any) {
      console.error('Failed to load model:', error);
      if (!abortControllerRef.current?.signal.aborted) {
        setError(`Failed to load ${model.name}: ${error.message}`);
        setChatState('error');
      }
    }
  };

  const generateResponse = async (userMessage: string) => {
    if (!pipelineRef.current || !currentConversationId) {
      setError('Model not loaded or no conversation selected');
      return;
    }

    try {
      setChatState('generating');
      setError('');

      // Add user message to database and UI
      const userMessageObj: Omit<ChatMessage, 'id'> = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
        conversation_id: currentConversationId
      };

      await chatStorage.addMessage(userMessageObj);
      setMessages(prev => [...prev, { ...userMessageObj, id: Date.now() }]);

      // Build context from recent messages
      const recentMessages = messages.slice(-5); // Last 5 messages for context
      let prompt = '';
      
      for (const msg of recentMessages) {
        prompt += `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}\n`;
      }
      prompt += `Human: ${userMessage}\nAssistant:`;

      // Generate response
      const result = await pipelineRef.current(prompt, {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: pipelineRef.current.tokenizer.eos_token_id,
        num_return_sequences: 1
      });

      let response = result[0].generated_text;
      
      // Extract only the assistant's response (after the last "Assistant:")
      const assistantIndex = response.lastIndexOf('Assistant:');
      if (assistantIndex !== -1) {
        response = response.substring(assistantIndex + 'Assistant:'.length).trim();
      }

      // Clean up response
      response = response.split('\n')[0].trim(); // Take only first line
      if (!response) {
        response = "I'm sorry, I couldn't generate a proper response. Could you try asking something else?";
      }

      // Add assistant message to database and UI
      const assistantMessageObj: Omit<ChatMessage, 'id'> = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        conversation_id: currentConversationId,
        model: selectedModel.id,
        tokens_used: result[0].generated_text.length // Rough token estimate
      };

      await chatStorage.addMessage(assistantMessageObj);
      setMessages(prev => [...prev, { ...assistantMessageObj, id: Date.now() + 1 }]);

      setChatState('idle');
    } catch (error: any) {
      console.error('Generation failed:', error);
      setError(`Generation failed: ${error.message}`);
      setChatState('error');
    }
  };

  const handleSendMessage = async () => {
    const message = inputMessage.trim();
    if (!message || chatState !== 'idle') return;

    // Create conversation if none exists
    if (!currentConversationId) {
      await createNewConversation();
      // The conversation ID will be set, so we can continue
      return; // This will re-trigger with the new conversation
    }

    setInputMessage('');
    await generateResponse(message);
    await loadConversations(); // Refresh to update message counts
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const abortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setChatState('idle');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isInitialized) {
    return (
      <div className="chat-app">
        <div className="chat-loading">
          <div className="loading-spinner">🤖</div>
          <p>Initializing chat storage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>💬 AI Chat</h2>
            <button 
              className="new-chat-button"
              onClick={createNewConversation}
              disabled={chatState === 'loading_model' || chatState === 'generating'}
            >
              ➕ New Chat
            </button>
          </div>

          <div className="model-selector">
            <button 
              className="model-button"
              onClick={() => setShowModelSelector(!showModelSelector)}
            >
              🤖 {selectedModel.name}
              {loadedModel !== selectedModel.id && <span className="model-status unloaded">Not loaded</span>}
              {loadedModel === selectedModel.id && <span className="model-status loaded">Ready</span>}
            </button>

            {showModelSelector && (
              <div className="model-dropdown">
                {AVAILABLE_MODELS.map(model => (
                  <button
                    key={model.id}
                    className={`model-option ${selectedModel.id === model.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelSelector(false);
                    }}
                  >
                    <div className="model-info">
                      <div className="model-name">{model.name}</div>
                      <div className="model-size">{model.size}</div>
                      <div className="model-desc">{model.description}</div>
                    </div>
                    {loadedModel === model.id && <span className="loaded-indicator">✅</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <div className="no-conversations">
                <p>No conversations yet</p>
                <p>Click "New Chat" to start!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => loadConversation(conv.id)}
                >
                  <div className="conversation-info">
                    <div className="conversation-title">{conv.title}</div>
                    <div className="conversation-meta">
                      {conv.message_count} messages • {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    className="delete-conversation"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {loadedModel !== selectedModel.id ? (
            <div className="model-loading-section">
              <div className="model-prompt">
                <h3>🤖 Load AI Model</h3>
                <p>Selected: <strong>{selectedModel.name}</strong> ({selectedModel.size})</p>
                <p>{selectedModel.description}</p>
                
                {chatState === 'loading_model' ? (
                  <div className="loading-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${modelProgress.progress}%` }}
                      />
                    </div>
                    <p>{modelProgress.message}</p>
                    <button 
                      className="abort-button"
                      onClick={abortGeneration}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    className="load-model-button"
                    onClick={() => loadModel(selectedModel)}
                  >
                    📥 Load {selectedModel.name}
                  </button>
                )}
                
                <div className="model-info-note">
                  <p><strong>Note:</strong> Models run entirely in your browser. First load will download the model files.</p>
                  <ul>
                    <li>✅ Completely private - no data sent to servers</li>
                    <li>✅ Works offline after download</li>
                    <li>✅ Free to use</li>
                    <li>⚠️ Large models may be slow on older devices</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="chat-messages">
                {currentConversationId ? (
                  <>
                    {messages.length === 0 ? (
                      <div className="welcome-message">
                        <h3>👋 Welcome to AI Chat!</h3>
                        <p>Start a conversation with your local AI assistant.</p>
                        <div className="chat-tips">
                          <h4>💡 Tips:</h4>
                          <ul>
                            <li>Ask questions or have a conversation</li>
                            <li>The AI runs locally in your browser</li>
                            <li>All conversations are saved locally</li>
                            <li>Try asking about anything - coding, writing, ideas!</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div
                          key={message.id}
                          className={`message ${message.role}`}
                        >
                          <div className="message-header">
                            <span className="message-role">
                              {message.role === 'user' ? '👤 You' : '🤖 AI'}
                            </span>
                            <span className="message-time">
                              {formatTimestamp(message.timestamp)}
                            </span>
                            {message.model && (
                              <span className="message-model">
                                {AVAILABLE_MODELS.find(m => m.id === message.model)?.name}
                              </span>
                            )}
                          </div>
                          <div className="message-content">
                            {message.content}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {chatState === 'generating' && (
                      <div className="message assistant generating">
                        <div className="message-header">
                          <span className="message-role">🤖 AI</span>
                          <span className="message-status">Thinking...</span>
                        </div>
                        <div className="message-content">
                          <div className="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="no-conversation-selected">
                    <h3>💬 Select a conversation or create a new one</h3>
                    <button 
                      className="create-conversation-button"
                      onClick={createNewConversation}
                    >
                      ➕ Start New Conversation
                    </button>
                  </div>
                )}
              </div>

              {currentConversationId && (
                <div className="chat-input-section">
                  {error && (
                    <div className="error-message">
                      {error}
                      <button onClick={() => setError('')}>✕</button>
                    </div>
                  )}

                  <div className="chat-input-container">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        chatState === 'generating' 
                          ? 'AI is thinking...' 
                          : 'Type your message... (Enter to send, Shift+Enter for new line)'
                      }
                      disabled={chatState === 'generating'}
                      className="chat-input"
                      rows={1}
                    />
                    
                    {chatState === 'generating' ? (
                      <button 
                        className="chat-button abort"
                        onClick={abortGeneration}
                      >
                        ⏹️ Stop
                      </button>
                    ) : (
                      <button
                        className="chat-button send"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || chatState !== 'idle'}
                      >
                        ➤ Send
                      </button>
                    )}
                  </div>

                  <div className="chat-status">
                    <span className="model-indicator">
                      🤖 {selectedModel.name} • {messages.length} messages
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
