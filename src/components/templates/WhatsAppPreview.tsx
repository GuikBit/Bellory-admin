import { cn } from '../../utils/cn'
import { Check, Camera, Mic, Paperclip, ChevronLeft, MoreVertical } from 'lucide-react'

interface WhatsAppPreviewProps {
  text: string
  senderName?: string
}

function formatWhatsAppText(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // WhatsApp formatting
  html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>')
  html = html.replace(/~([^~]+)~/g, '<del>$1</del>')

  // Line breaks
  html = html.replace(/\n/g, '<br/>')

  return html
}

export function WhatsAppPreview({ text, senderName = 'Bellory' }: WhatsAppPreviewProps) {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className="rounded-xl overflow-hidden border border-[#d8ccc4] dark:border-[#2D2925] max-w-[360px] mx-auto">
      {/* Header */}
      <div className="bg-[#075e54] dark:bg-[#1f2c34] px-3 py-2.5 flex items-center gap-3">
        <ChevronLeft size={20} className="text-white/80" />
        <div className="w-8 h-8 rounded-full bg-[#25d366] flex items-center justify-center">
          <span className="text-white text-xs font-bold">{senderName.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <p className="text-white text-sm font-medium leading-tight">{senderName}</p>
          <p className="text-white/60 text-[10px]">online</p>
        </div>
        <MoreVertical size={18} className="text-white/70" />
      </div>

      {/* Chat area */}
      <div
        className="p-3 min-h-[200px] max-h-[400px] overflow-y-auto"
        style={{ backgroundColor: '#e5ddd5' }}
      >
        {/* Message bubble */}
        <div className="flex justify-end">
          <div
            className="relative max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-[1.4] shadow-sm"
            style={{ backgroundColor: '#dcf8c6' }}
          >
            <div
              className="text-[#303030] break-words [&_strong]:font-semibold [&_em]:italic [&_del]:line-through"
              dangerouslySetInnerHTML={{ __html: formatWhatsAppText(text) }}
            />
            <div className="flex items-center justify-end gap-1 mt-1 -mb-0.5">
              <span className="text-[10px] text-[#667781]">{timeStr}</span>
              <Check size={12} className="text-[#53bdeb]" />
              <Check size={12} className="text-[#53bdeb] -ml-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#f0f0f0] dark:bg-[#1f2c34] px-2 py-2 flex items-center gap-2">
        <Paperclip size={20} className="text-[#54656f] shrink-0" />
        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-3 py-1.5">
          <span className="text-[#667781] text-sm">Mensagem...</span>
        </div>
        <Camera size={20} className="text-[#54656f] shrink-0" />
        <Mic size={20} className="text-[#54656f] shrink-0" />
      </div>
    </div>
  )
}
