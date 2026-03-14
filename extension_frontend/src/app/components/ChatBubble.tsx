import { Building2, User } from 'lucide-react';

interface ChatBubbleProps {
  type: 'bot' | 'user';
  titleHi?: string;
  titleEn?: string;
  content?: string;
  children?: React.ReactNode;
  hasRedBorder?: boolean;
}

export default function ChatBubble({ type, titleHi, titleEn, content, children, hasRedBorder }: ChatBubbleProps) {
  if (type === 'bot') {
    return (
      <div className="flex gap-2.5 mb-4 px-4">
        {/* Bot Avatar */}
        <div className="w-7 h-7 rounded-full bg-saffron flex items-center justify-center flex-shrink-0 mt-0.5">
          <Building2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
        
        {/* Bubble */}
        <div className="flex-1">
          <div 
            className={`bg-surface rounded-lg rounded-tl-sm p-3.5 border ${
              hasRedBorder ? 'border-l-2 border-risk-red border-t border-r border-b border-border-custom' : 'border-border-custom'
            }`}
          >
            {(titleHi || titleEn) && (
              <div className="mb-1">
                {titleHi && <div className="text-sm font-semibold text-navy">{titleHi}</div>}
                {titleEn && <div className="text-xs text-muted-text">{titleEn}</div>}
              </div>
            )}
            {content && <div className="text-sm text-slate">{content}</div>}
            {children}
          </div>
        </div>
      </div>
    );
  }

  // User bubble
  return (
    <div className="flex justify-end mb-4 px-4">
      <div className="flex gap-2.5">
        <div className="bg-green-light border border-green/20 rounded-lg rounded-tr-sm p-3 max-w-[75%]">
          <div className="text-sm text-green-deep font-medium">
            {content || children}
          </div>
        </div>
        {/* User Avatar */}
        <div className="w-7 h-7 rounded-full bg-green flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
}