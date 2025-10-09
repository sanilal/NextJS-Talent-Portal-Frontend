'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Search, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { messagesAPI } from '@/lib/api/messages';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDateRelative } from '@/lib/utils';
import type { Conversation, Message } from '@/types';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: messagesAPI.getConversations,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: () => selectedConversation ? messagesAPI.getConversation(selectedConversation) : null,
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });

  const messages = messagesData?.data || [];

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data: { receiver_id: number; message: string }) =>
      messagesAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => messagesAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    sendMutation.mutate({
      receiver_id: selectedConversation,
      message: messageText,
    });
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.user.id);
    
    // Mark unread messages as read
    if (conversation.unread_count > 0 && conversation.last_message) {
      markAsReadMutation.mutate(conversation.last_message.id);
    }
  };

  const filteredConversations = conversations?.filter((conv) => {
    if (!searchQuery) return true;
    const userName = `${conv.user.first_name} ${conv.user.last_name}`.toLowerCase();
    return userName.includes(searchQuery.toLowerCase());
  }) || [];

  const selectedConversationData = conversations?.find(
    (conv) => conv.user.id === selectedConversation
  );

  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="flex h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Conversations List - Left Side */}
        <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Messages
            </h2>
            
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
              </div>
            ) : (
              <div>
                {filteredConversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`
                      w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${selectedConversation === conversation.user.id ? 'bg-gray-50 dark:bg-gray-700' : ''}
                      ${conversation.unread_count > 0 ? 'border-l-4 border-primary-600' : ''}
                    `}
                  >
                    {/* Avatar */}
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                      {conversation.user.first_name?.charAt(0)}{conversation.user.last_name?.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`
                          text-sm font-medium truncate
                          ${conversation.unread_count > 0 ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300'}
                        `}>
                          {conversation.user.first_name} {conversation.user.last_name}
                        </h3>
                        {conversation.last_message && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                            {formatDateRelative(conversation.last_message.created_at)}
                          </span>
                        )}
                      </div>
                      
                      {conversation.last_message && (
                        <p className={`
                          text-sm truncate
                          ${conversation.unread_count > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400'}
                        `}>
                          {conversation.last_message.message}
                        </p>
                      )}
                      
                      {conversation.unread_count > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                            {conversation.unread_count} new
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread - Right Side */}
        <div className="flex-1 flex flex-col">
          {selectedConversation && selectedConversationData ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {selectedConversationData.user.first_name?.charAt(0)}
                    {selectedConversationData.user.last_name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {selectedConversationData.user.first_name} {selectedConversationData.user.last_name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Active now
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-md"></div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message: Message) => {
                    const isSender = message.sender_id === currentUser?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-md px-4 py-2 rounded-lg
                            ${isSender 
                              ? 'bg-primary-600 text-white' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                            }
                          `}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className={`
                            text-xs mt-1
                            ${isSender ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'}
                          `}>
                            {formatDateRelative(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMutation.isPending}
                    isLoading={sendMutation.isPending}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}