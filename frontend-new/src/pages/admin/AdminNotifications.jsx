import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import API_URL from '../../config/api';

export const AdminNotifications = () => {
  const { theme } = useTheme();
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState('');

  const token = localStorage.getItem('vizo_admin_token');

  const fetchInquiries = async () => {
    try {
      const res = await fetch(`${API_URL}/api/inquiries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
        // Automatically select first inquiry if present and none selected
        if (data.length > 0 && !selectedInquiry) {
          setSelectedInquiry(data[0]);
          if (!data[0].isRead) {
            markAsRead(data[0]._id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isRead: true })
      });
      // Refresh local list state
      setInquiries(prev => prev.map(inq => inq._id === id ? { ...inq, isRead: true } : inq));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleSelect = (inquiry) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.isRead) {
      markAsRead(inquiry._id);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setAttachedFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setAttachmentUrl(data.fileUrl);
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Upload failed');
        setAttachmentUrl('');
        setAttachedFileName('');
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('File upload failed.');
      setAttachmentUrl('');
      setAttachedFileName('');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl('');
    setAttachedFileName('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText || !selectedInquiry) return;

    setSending(true);
    try {
      const res = await fetch(`${API_URL}/api/inquiries/${selectedInquiry._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: replyText,
          attachmentUrl: attachmentUrl
        })
      });

      if (res.ok) {
        const updatedInquiry = await res.json();
        setSelectedInquiry(updatedInquiry);
        setReplyText('');
        setAttachmentUrl('');
        setAttachedFileName('');
        // Refresh inquiries list to update message snippet and status
        fetchInquiries();
      }
    } catch (err) {
      console.error('Failed to reply to inquiry:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex border border-black/10 dark:border-white/10 rounded-[2rem] overflow-hidden glass-panel">
      {/* Left Pane: Inquiries List */}
      <section className="w-1/3 min-w-[340px] border-r border-black/10 dark:border-white/10 flex flex-col bg-black/5 dark:bg-white/5">
        <div className="p-6 border-b border-black/10 dark:border-white/10">
          <h3 className="text-xl font-bold">Inbox</h3>
          <p className={`font-label-sm text-[10px] font-bold uppercase tracking-widest mt-1 ${
            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
          }`}>
            {inquiries.filter(i => !i.isRead).length} New Inquiries
          </p>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-3">
          {inquiries.map(inq => {
            const isSelected = selectedInquiry && selectedInquiry._id === inq._id;
            return (
              <div
                key={inq._id}
                onClick={() => handleSelect(inq)}
                className={`glass-card rounded-2xl p-4 cursor-pointer relative transition-all duration-300 ${
                  isSelected 
                    ? theme === 'dark'
                      ? 'border-l-4 border-l-[#00f0ff] bg-white/5'
                      : 'border-l-4 border-l-[#0052FF] bg-black/5'
                    : 'border-l-4 border-l-transparent hover:bg-white/5'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="font-bold text-xs truncate max-w-[150px]">{inq.name}</span>
                  <span className="text-[9px] text-on-surface-variant font-label-sm uppercase">
                    {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                {inq.serviceChips && inq.serviceChips.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-2 overflow-hidden">
                    <span className="material-symbols-outlined text-[12px] text-on-surface-variant">architecture</span>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter truncate">
                      {inq.serviceChips.join(', ')}
                    </span>
                  </div>
                )}

                <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                  {inq.message}
                </p>

                {!inq.isRead && (
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full neon-glow ${
                    theme === 'dark' ? 'bg-[#00E5FF]' : 'bg-[#0052FF]'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Right Pane: Thread View & Quick Reply */}
      <section className="flex-grow flex flex-col bg-black/10 dark:bg-black/30">
        {selectedInquiry ? (
          <>
            {/* Header info */}
            <div className="h-20 border-b border-black/10 dark:border-white/10 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-fixed-dim">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none">{selectedInquiry.name}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-on-surface-variant uppercase tracking-widest">
                    <span>{selectedInquiry.email}</span>
                    {selectedInquiry.whatsapp && (
                      <>
                        <span className="text-white/20">•</span>
                        <a 
                          href={`https://wa.me/${selectedInquiry.whatsapp.replace(/[^\d]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`inline-flex items-center gap-1 hover:underline ${
                            theme === 'dark' ? 'text-[#00f0ff]' : 'text-[#0052FF]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          <span>WhatsApp: {selectedInquiry.whatsapp}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedInquiry.serviceChips && selectedInquiry.serviceChips.length > 0 && (
                <div className="flex gap-1.5">
                  {selectedInquiry.serviceChips.map(chip => (
                    <span key={chip} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Replies Log */}
            <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-black/20">
              {/* Original Message */}
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-primary-fixed-dim">{selectedInquiry.name.toUpperCase()}</span>
                  <span className="text-[9px] text-on-surface-variant">
                    {new Date(selectedInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="glass-panel p-4 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl bg-white/5 space-y-4">
                  <p className="text-sm leading-relaxed">{selectedInquiry.message}</p>
                  
                  {selectedInquiry.attachmentUrl && (
                    <div className="pt-2 border-t border-white/5 flex items-center">
                      <a 
                        href={selectedInquiry.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                          theme === 'dark' 
                            ? 'bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20' 
                            : 'bg-[#0052FF]/10 text-[#0052FF] hover:bg-[#0052FF]/20'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                        <span>View Attachment ({selectedInquiry.attachmentUrl.split('.').pop().toUpperCase()})</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Thread replies */}
              {selectedInquiry.replies && selectedInquiry.replies.map((rep, idx) => {
                const isAdmin = rep.sender === 'admin';
                return (
                  <div 
                    key={idx} 
                    className={`flex flex-col gap-2 max-w-2xl ${isAdmin ? 'ml-auto items-end' : ''}`}
                  >
                    <div className="flex items-baseline gap-2">
                      {!isAdmin && <span className="text-xs font-bold text-primary-fixed-dim">CLIENT</span>}
                      <span className="text-[9px] text-on-surface-variant">
                        {new Date(rep.timestamp).toLocaleString()}
                      </span>
                      {isAdmin && <span className="text-xs font-bold text-purple-400">SYS_ADMIN</span>}
                    </div>
                    <div className={`p-4 rounded-2xl ${
                      isAdmin 
                        ? 'bg-purple-500/10 border border-purple-500/30 rounded-tl-2xl rounded-bl-2xl rounded-br-2xl' 
                        : 'bg-white/5 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl'
                    }`}>
                      <p className="text-sm leading-relaxed">{rep.message}</p>
                      {rep.attachmentUrl && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center">
                          <a 
                            href={rep.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold underline"
                          >
                            <span className="material-symbols-outlined text-xs">attachment</span>
                            <span>View Attachment ({rep.attachmentUrl.split('.').pop().toUpperCase()})</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick reply area */}
            <form onSubmit={handleSendReply} className="p-6 border-t border-black/10 dark:border-white/10">
              <div className="relative glass-panel rounded-2xl overflow-hidden focus-within:border-primary/50 transition-all shadow-xl">
                <textarea 
                  className="w-full bg-transparent p-4 min-h-[90px] text-sm outline-none resize-none border-none focus:ring-0 placeholder:text-on-surface-variant/40 font-mono"
                  placeholder="Type a response message thread..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  required
                />
                
                {/* File attachment preview */}
                {(uploading || attachmentUrl) && (
                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">attachment</span>
                      {uploading ? (
                        <span className="text-on-surface-variant animate-pulse">Uploading {attachedFileName}...</span>
                      ) : (
                        <span className="font-semibold text-green-400">Attached: {attachedFileName}</span>
                      )}
                    </div>
                    {!uploading && (
                      <button 
                        type="button" 
                        onClick={removeAttachment}
                        className="text-red-400 hover:text-red-300 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-white/5 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-all">
                      <span className="material-symbols-outlined text-sm">attach_file</span>
                      <span>Attach File</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleFileChange} 
                        disabled={uploading || sending}
                      />
                    </label>
                    {uploading && <span className="text-[10px] text-on-surface-variant font-mono animate-pulse">Uploading file...</span>}
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={sending || uploading || !replyText}
                    className={`px-6 py-2 rounded font-bold flex items-center gap-2 transition-all text-xs ${
                      theme === 'dark'
                        ? 'bg-[#00f0ff] text-black hover:brightness-110 shadow-lg shadow-[#00f0ff]/10'
                        : 'bg-[#0052FF] text-white hover:bg-[#003bbb]'
                    } disabled:opacity-50`}
                  >
                    <span>Send Reply</span>
                    <span className="material-symbols-outlined text-xs">send</span>
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center text-on-surface-variant text-sm font-semibold">
            No inquiries selected.
          </div>
        )}
      </section>
    </div>
  );
};
