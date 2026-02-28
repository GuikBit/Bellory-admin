interface EmailPreviewProps {
  html: string
  assunto?: string
}

export function EmailPreview({ html, assunto }: EmailPreviewProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-[#d8ccc4] dark:border-[#2D2925] max-w-[480px] mx-auto">
      {/* Email header */}
      <div className="bg-[#faf8f6] dark:bg-[#1A1715] px-4 py-3 border-b border-[#d8ccc4] dark:border-[#2D2925]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#db6f57] to-[#8b3d35] flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">Bellory</p>
            <p className="text-[10px] text-[#6b5d57] dark:text-[#7A716A]">noreply@bellory.com.br</p>
          </div>
        </div>
        {assunto && (
          <p className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB] pl-10">{assunto}</p>
        )}
      </div>

      {/* Email body — backend always returns full HTML */}
      <div className="bg-white dark:bg-[#0D0B0A] min-h-[200px] max-h-[400px] overflow-y-auto">
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin"
          className="w-full min-h-[200px] border-0"
          style={{ height: '300px' }}
          title="Email preview"
        />
      </div>
    </div>
  )
}
