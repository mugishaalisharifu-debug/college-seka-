export type ContactMessageStatus = "New" | "Reviewed" | "Pending" | "Responded";

export interface ContactMessage {
  id: number | string;
  sender: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  time: string;
}

const STORAGE_KEY = "cfsg-contact-messages";

export const DEFAULT_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 1,
    sender: "Aline Mukamana",
    email: "aline.m@gmail.com",
    phone: "+250 788 123 456",
    subject: "Admissions Inquiry",
    message: "Could you please share the admission requirements and deadlines for Senior One entering students?",
    status: "New",
    time: "Today, 09:15 AM",
  },
  {
    id: 2,
    sender: "Hassan Ndayambaje",
    email: "hassan.n@yahoo.com",
    phone: "+250 783 987 654",
    subject: "School Fees Question",
    message: "I want to confirm the school fee payment plan options for the upcoming academic term.",
    status: "Reviewed",
    time: "Yesterday, 03:40 PM",
  },
  {
    id: 3,
    sender: "Grace Uwase",
    email: "uwase.grace@hotmail.com",
    phone: "+250 785 456 789",
    subject: "Schedule Visit",
    message: "We would like to schedule a campus tour for our daughter and learn more about your facilities.",
    status: "Pending",
    time: "Jul 30, 2026",
  },
  {
    id: 4,
    sender: "Claude Manzi",
    email: "claude.manzi@outlook.com",
    phone: "+250 782 111 222",
    subject: "Academic Programs & Support",
    message: "Are there any merit-based scholarships available for academically gifted secondary students?",
    status: "Responded",
    time: "Jul 28, 2026",
  },
];

const formatMessageTime = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getStoredContactMessages = (): ContactMessage[] => {
  if (typeof window === "undefined") {
    return DEFAULT_CONTACT_MESSAGES;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_CONTACT_MESSAGES;
    }

    const parsed = JSON.parse(stored) as ContactMessage[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONTACT_MESSAGES;
  } catch {
    return DEFAULT_CONTACT_MESSAGES;
  }
};

export const saveStoredContactMessages = (messages: ContactMessage[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

export const addStoredContactMessage = (input: Omit<ContactMessage, "id" | "status" | "time">) => {
  const message: ContactMessage = {
    id: Date.now(),
    status: "New",
    time: formatMessageTime(new Date()),
    ...input,
  };

  const nextMessages = [message, ...getStoredContactMessages()];
  saveStoredContactMessages(nextMessages);
  return message;
};
