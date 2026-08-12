'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Send, ChevronDown } from 'lucide-react';
import { formatTZ } from '@/libs/dayjs';
import { buildWhatsAppUrl, openWhatsApp } from '@/libs/whatsapp';

const DEFAULT_GREETINGS = [
	'Hi! How can we help? 👋',
	'Got a question? We are happy to help! 💬',
	'Chat with us now, it is free! ✨',
];

const DEFAULT_QUICK_REPLIES = [
	'Hi, I would like to know more 👋',
	'Is this still available? 📋',
	'How do I place an order? 💰',
	'How long is the estimated delivery time? 🔍',
	'I would like to ask about my order 🔄',
];

export interface WhatsAppButtonProps {
	/** Destination WhatsApp number (any format, will be normalized automatically). If empty, the button is not shown. */
	phone?: string | null;
	/** Name shown in the chat header and welcome message. */
	name?: string;
	/** Small caption below the name in the chat header. */
	subtitle?: string;
	/** Welcome message in the chat bubble (supports ReactNode so elements like <strong> can be inserted). */
	welcomeMessage?: React.ReactNode;
	/** Default message sent if the user leaves the input field empty. */
	defaultMessage?: string;
	/** List of greeting messages that rotate on the floating bubble. */
	greetings?: string[];
	/** List of quick replies the user can select. */
	quickReplies?: string[];
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden="true">
		<path d="M4.868 43.303l2.694-9.835a18.863 18.863 0 01-2.53-9.489C5.034 13.515 13.548 5 24.014 5c5.079.002 9.845 1.979 13.43 5.566 3.584 3.588 5.558 8.356 5.556 13.428-.004 10.465-8.52 18.978-18.986 18.978h-.008a18.941 18.941 0 01-9.053-2.301L4.868 43.303zm10.144-5.858l.577.342a15.733 15.733 0 008.028 2.199h.006c8.698 0 15.778-7.077 15.781-15.776.002-4.213-1.635-8.18-4.614-11.161a15.703 15.703 0 00-11.157-4.621c-8.703 0-15.783 7.076-15.786 15.774a15.72 15.72 0 002.43 8.396l.379.602-1.609 5.875 6.965-1.63z" />
		<path d="M19.268 16.045c-.355-.79-.729-.806-1.068-.82-.277-.012-.594-.011-.911-.011s-.83.124-1.265.619c-.435.495-1.661 1.622-1.661 3.956 0 2.334 1.7 4.59 1.937 4.907.237.316 3.282 5.259 8.104 7.161 4.007 1.58 4.823 1.266 5.693 1.187.87-.079 2.807-1.147 3.202-2.255.395-1.108.395-2.057.277-2.255-.118-.198-.435-.316-.911-.554s-2.807-1.385-3.242-1.543c-.435-.158-.751-.237-1.068.238-.316.474-1.225 1.543-1.502 1.859-.277.317-.554.357-1.03.119-.475-.237-2.007-.74-3.823-2.358-1.413-1.259-2.366-2.814-2.643-3.29-.277-.474-.03-.731.208-.967.213-.213.474-.554.712-.831.236-.277.315-.475.473-.791.158-.317.079-.594-.04-.831-.118-.237-1.038-2.581-1.443-3.507z" />
	</svg>
);

export const WhatsAppButton = ({
	phone,
	name = 'Us',
	subtitle = 'Support Team · Usually replies fast',
	welcomeMessage,
	defaultMessage,
	greetings = DEFAULT_GREETINGS,
	quickReplies = DEFAULT_QUICK_REPLIES,
}: WhatsAppButtonProps) => {
	const [greetingIndex, setGreetingIndex] = useState(0);
	const [greetingVisible, setGreetingVisible] = useState(true);
	const [showBubble, setShowBubble] = useState(true);
	const [isPulsing, setIsPulsing] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [message, setMessage] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (showModal) return;
		const interval = setInterval(() => {
			setGreetingVisible(false);
			setTimeout(() => {
				setGreetingIndex((prev) => (prev + 1) % greetings.length);
				setGreetingVisible(true);
				setIsPulsing(true);
				setTimeout(() => setIsPulsing(false), 700);
			}, 400);
		}, 4000);
		return () => clearInterval(interval);
	}, [showModal]);

	useEffect(() => {
		if (showModal) return;
		const hide = setTimeout(() => setShowBubble(false), 12000);
		const show = setInterval(() => {
			setShowBubble(true);
			setTimeout(() => setShowBubble(false), 8000);
		}, 20000);
		return () => {
			clearTimeout(hide);
			clearInterval(show);
		};
	}, [showModal]);

	const openModal = () => {
		setShowBubble(false);
		setShowModal(true);
		setTimeout(() => setModalVisible(true), 10);
		setTimeout(() => textareaRef.current?.focus(), 300);
	};

	const closeModal = () => {
		setModalVisible(false);
		setTimeout(() => setShowModal(false), 300);
	};

	const sendMessage = () => {
		if (!phone) return;
		const text = message.trim() || defaultMessage || `Hi, I would like to ask about a product at ${name}.`;
		const url = buildWhatsAppUrl(phone, text);
		openWhatsApp(url);
		closeModal();
		setMessage('');
	};

	const selectQuickReply = (text: string) => {
		setMessage(text);
		textareaRef.current?.focus();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	// Hide if the WhatsApp number is not configured yet
	if (!phone) return null;

	return (
		<>
			{showModal && (
				<div
					className={`fixed z-50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300
						bottom-0 right-0 left-0 w-full rounded-b-none
						sm:bottom-24 sm:right-4 sm:left-auto sm:w-[360px] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl
						${modalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}
				>
					{/* Header */}
					<div className="bg-green-600 px-4 py-3 flex items-center gap-3">
						<div className="relative flex-shrink-0">
							<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
								<WhatsAppIcon className="w-6 h-6 text-white" />
							</div>
							<span className="absolute bottom-0 right-0 w-3 h-3 bg-green-300 border-2 border-green-600 rounded-full" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-white font-semibold text-sm truncate">{name}</p>
							<p className="text-green-200 text-xs">{subtitle}</p>
						</div>
						<button onClick={closeModal} className="text-white/70 hover:text-white transition-colors flex-shrink-0" aria-label="Close">
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Chat body */}
					<div
						className="px-4 pt-4 pb-3 space-y-3"
						style={{
							background:
								"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300000008'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\") var(--muted)",
						}}
					>
						<div className="flex items-end gap-2">
							<div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
								<WhatsAppIcon className="w-4 h-4 text-white" />
							</div>
							<div className="bg-card rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm max-w-[85%]">
								<p className="text-sm text-card-foreground leading-relaxed">
									{welcomeMessage ?? (
										<>
											Hi! 👋 Welcome to <strong>{name}</strong>.<br />
											How can we help? Please choose a topic below.
										</>
									)}
								</p>
								<p className="text-[10px] text-muted-foreground text-right mt-1">
									{formatTZ(new Date().toISOString(), 'HH:mm')}
								</p>
							</div>
						</div>

						<div className="space-y-1.5 pt-1">
							<p className="text-[11px] text-muted-foreground text-center">Choose a question topic:</p>
							{quickReplies.map((reply, i) => (
								<button
									key={i}
									onClick={() => selectQuickReply(reply)}
									className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition-all duration-150 ${
										message === reply
											? 'bg-green-500 text-white border-green-500 shadow-sm'
											: 'bg-card text-foreground border-border hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-950'
									}`}
								>
									{reply}
								</button>
							))}
						</div>
					</div>

					{/* Input area */}
					<div className="bg-muted px-3 py-2.5 flex items-end gap-2 border-t border-border">
						<textarea
							ref={textareaRef}
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message..."
							rows={1}
							className="flex-1 resize-none bg-background rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-green-400 transition-colors max-h-28 overflow-y-auto shadow-sm"
							style={{ fieldSizing: 'content' } as React.CSSProperties}
						/>
						<button
							onClick={sendMessage}
							className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white flex items-center justify-center shadow transition-all duration-150 hover:scale-105 active:scale-95"
							aria-label="Send message"
						>
							<Send className="w-4 h-4" />
						</button>
					</div>

					<div className="bg-muted pb-2 flex items-center justify-center gap-1">
						<WhatsAppIcon className="w-3 h-3 text-green-600" />
						<span className="text-[10px] text-muted-foreground">Continuing to WhatsApp</span>
					</div>
				</div>
			)}

			<div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 pointer-events-none ${showModal ? 'hidden sm:flex' : 'flex'}`}>
				{!showModal && (
					<div className={`transition-all duration-500 ease-in-out ${showBubble ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
						<div className="relative bg-card rounded-2xl rounded-br-sm shadow-xl border border-border px-4 py-3 max-w-[220px]">
							<button
								onClick={() => setShowBubble(false)}
								className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground flex items-center justify-center text-xs leading-none transition-colors"
								aria-label="Close"
							>
								×
							</button>
							<p className={`text-[13px] font-medium text-foreground leading-snug transition-all duration-300 ${greetingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
								{greetings[greetingIndex]}
							</p>
							<div className="flex items-center gap-1 mt-2">
								<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:0ms]" />
								<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:150ms]" />
								<span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-bounce [animation-delay:300ms]" />
							</div>
							<div className="absolute bottom-0 right-3 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-[var(--card)]" />
						</div>
					</div>
				)}

				<div className="relative flex flex-col items-end pointer-events-auto">
					{!showModal && (
						<>
							<span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-30 scale-110" />
							<span className="absolute inset-0 rounded-full animate-ping bg-green-300 opacity-20 scale-125 [animation-delay:400ms]" />
						</>
					)}
					<button
						onClick={showModal ? closeModal : openModal}
						aria-label="Chat WhatsApp"
						className={`
							relative flex items-center gap-0 overflow-hidden
							bg-green-500 hover:bg-green-600 active:bg-green-700
							text-white rounded-full shadow-lg hover:shadow-green-500/40 hover:shadow-2xl
							transition-all duration-300
							w-14 h-14 hover:w-44
							group
							${isPulsing && !showModal ? 'scale-110' : 'scale-100'}
						`}
					>
						<span className="flex items-center justify-center w-14 h-14 flex-shrink-0">
							{showModal ? <ChevronDown className="w-6 h-6" /> : <WhatsAppIcon className="w-7 h-7" />}
						</span>
						<span className="text-sm font-semibold whitespace-nowrap pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100">
							{showModal ? 'Close Chat' : 'Contact Us'}
						</span>
					</button>
				</div>
			</div>
		</>
	);
};
