'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Character } from '@/types/character';
import {
  ConversationMessageWithRelations,
  formatMessageTime,
  getMessageAuthor,
  isCloseInTime,
  isSameAuthor,
  MessageFormData,
} from '@/types/conversation';
import { useEffect, useRef, useState } from 'react';

interface ConversationMessagesProps {
  conversationId: string;
  campaignId: string;
  target: 'users' | 'characters';
  isClosed: boolean;
  onRefresh?: () => void;
}

export function ConversationMessages({
  conversationId,
  campaignId,
  target,
  isClosed,
  onRefresh,
}: ConversationMessagesProps) {
  const [messages, setMessages] = useState<ConversationMessageWithRelations[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState<MessageFormData>({
    message: '',
    authorType: 'user',
    authorId: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
    if (target === 'characters') {
      fetchCharacters();
    }
  }, [conversationId, target]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacters = async () => {
    try {
      const res = await fetch(`/api/characters?campaignId=${campaignId}`);
      const data = await res.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    if (formData.authorType === 'character' && !formData.authorId) {
      alert('Please select a character');
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setFormData({ message: '', authorType: 'user', authorId: '' });
      await fetchMessages();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const groupedMessages = messages.reduce((groups: ConversationMessageWithRelations[][], msg, idx) => {
    if (idx === 0) {
      groups.push([msg]);
    } else {
      const lastGroup = groups[groups.length - 1];
      const lastMsg = lastGroup[lastGroup.length - 1];
      if (isSameAuthor(lastMsg, msg) && isCloseInTime(lastMsg, msg)) {
        lastGroup.push(msg);
      } else {
        groups.push([msg]);
      }
    }
    return groups;
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No messages yet. Start the conversation!
          </div>
        ) : (
          groupedMessages.map((group, groupIdx) => {
            const firstMsg = group[0];
            const authorName = getMessageAuthor(firstMsg);
            const isCharacter = !!firstMsg.characterId;

            return (
              <div key={groupIdx} className="flex gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${isCharacter ? 'bg-purple-500' : 'bg-indigo-500'
                    }`}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Messages Group */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold">{authorName}</span>
                    {isCharacter && (
                      <span className="text-xs text-purple-600 font-medium">Character</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(firstMsg.createdAt)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {group.map((msg) => (
                      <div key={msg.id} className="text-gray-900 whitespace-pre-wrap">
                        {msg.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {!isClosed ? (
        <div className="border-t p-4 bg-white">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-4 items-center">
              <Label>Send as:</Label>
              <RadioGroup
                value={formData.authorType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, authorType: value as 'user' | 'character', authorId: '' }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="font-normal">
                    Myself
                  </Label>
                </div>
                {target === 'characters' && characters.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="character" id="character" />
                    <Label htmlFor="character" className="font-normal">
                      Character
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            {formData.authorType === 'character' && (
              <div>
                <select
                  className="w-full border rounded p-2"
                  value={formData.authorId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, authorId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select a character...</option>
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Textarea
                value={formData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Type your message..."
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={sending || !formData.message.trim()}>
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="border-t p-4 bg-gray-50 text-center text-muted-foreground">
          This conversation is closed. No new messages can be sent.
        </div>
      )}
    </div>
  );
}
