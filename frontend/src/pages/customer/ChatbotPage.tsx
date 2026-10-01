import { useEffect, useRef, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, ExternalLink, LoaderCircle, Send, UserRound } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { assetUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState } from "@/components/common/AsyncState";

interface ChatMedia { url: string; title: string; altText: string }
interface Message { id: string; role: "USER" | "ASSISTANT"; content: string; media?: ChatMedia[]; createdAt: string }
interface Conversation { id: string; title: string; messages: Message[] }

export const ChatbotPage = () => {
  const client = useQueryClient();
  const [conversationId, setConversationId] = useState<string>();
  const [error, setError] = useState("");
  const [pendingMessage, setPendingMessage] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  const conversations = useQuery({ queryKey: ["conversations"], queryFn: async () => (await api.get<{ data: Conversation[] }>("/chatbot/conversations")).data.data });
  const conversation = useQuery({ queryKey: ["conversation", conversationId], enabled: !!conversationId, queryFn: async () => (await api.get<{ data: Conversation }>(`/chatbot/conversations/${conversationId}`)).data.data });
  const create = useMutation({ mutationFn: async () => (await api.post<{ data: Conversation }>("/chatbot/conversations", {})).data.data, onSuccess: (data) => { setConversationId(data.id); client.invalidateQueries({ queryKey: ["conversations"] }); }, onError: (reason) => setError(errorMessage(reason)) });
  useEffect(() => { if (!conversationId && conversations.data?.length) setConversationId(conversations.data[0]!.id); else if (!conversationId && conversations.isSuccess && !conversations.data.length && !create.isPending) create.mutate(); }, [conversations.data, conversations.isSuccess, conversationId]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [conversation.data?.messages.length, pendingMessage]);
  const send = useMutation({ mutationFn: async (message: string) => (await api.post(`/chatbot/conversations/${conversationId}/messages`, { message })).data.data, onMutate: (message) => { setPendingMessage(message); setError(""); }, onSuccess: () => { client.invalidateQueries({ queryKey: ["conversation", conversationId] }); }, onSettled: () => setPendingMessage(""), onError: (reason) => setError(errorMessage(reason)) });
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = event.currentTarget; const message = String(new FormData(form).get("message")).trim(); if (message) { send.mutate(message); form.reset(); } };
  if (conversations.isLoading || create.isPending) return <LoadingState label="Đang mở trợ lý tư vấn..." />;
  if (conversations.isError) return <ErrorState message={errorMessage(conversations.error)} />;

  return <div className="mx-auto flex h-[calc(100svh-9rem)] max-w-4xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-600 text-white"><Bot className="h-5 w-5" /></span><div><h1 className="font-bold">Trợ lý tư vấn Green Wedding</h1><p className="text-xs text-slate-500">Tư vấn theo dữ liệu gói cưới, thực đơn và hợp đồng của bạn</p></div><Button variant="secondary" size="sm" className="ml-auto" onClick={() => create.mutate()}>Cuộc trò chuyện mới</Button></div>
    <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4 sm:p-6">
      {conversation.isLoading ? <LoadingState /> : conversation.data?.messages.length || pendingMessage ? <>
        {conversation.data?.messages.map((item) => <div key={item.id} className={`flex gap-3 ${item.role === "USER" ? "justify-end" : "justify-start"}`}>
          {item.role === "ASSISTANT" && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-600 text-white"><Bot className="h-4 w-4" /></span>}
          <div className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-6 ${item.role === "USER" ? "bg-primary-700 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
            <p className="whitespace-pre-wrap">{item.content}</p>
            {item.media?.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">{item.media.map((media) => <a key={`${item.id}-${media.url}`} href={assetUrl(media.url)} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-md border border-slate-200 bg-slate-50"><img src={assetUrl(media.url)} alt={media.altText} loading="lazy" className="aspect-[4/3] w-full object-cover transition group-hover:scale-105" /><span className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600">{media.title}<ExternalLink className="ml-auto h-3.5 w-3.5" /></span></a>)}</div> : null}
          </div>
          {item.role === "USER" && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600"><UserRound className="h-4 w-4" /></span>}
        </div>)}
        {pendingMessage && <div className="flex justify-end gap-3"><div className="max-w-[80%] rounded-lg bg-primary-700 px-4 py-3 text-sm leading-6 text-white"><p>{pendingMessage}</p><span className="mt-2 flex items-center gap-2 text-xs text-primary-100"><LoaderCircle className="h-3.5 w-3.5 animate-spin" />Đang tra cứu dữ liệu...</span></div><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600"><UserRound className="h-4 w-4" /></span></div>}
      </> : <div className="grid h-full place-items-center text-center"><div><Bot className="mx-auto h-10 w-10 text-primary-600" /><h2 className="mt-3 font-bold">Bạn cần tư vấn điều gì?</h2><p className="mt-1 text-sm text-slate-500">Hãy hỏi về ngân sách, thực đơn, tiền cọc hoặc quy trình đặt tiệc.</p></div></div>}
      <div ref={bottom} />
    </div>
    <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3"><div className="flex gap-2"><input name="message" autoComplete="off" className="form-control" placeholder="Nhập câu hỏi của bạn..." disabled={send.isPending || !conversationId} /><Button size="icon" aria-label="Gửi tin nhắn" disabled={send.isPending || !conversationId}>{send.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button></div>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</form>
  </div>;
};
