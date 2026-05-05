import styled from "styled-components";
import { useParams } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { Send, Users } from "lucide-react";
import { useHeader } from "@/context/HeaderContext";

// 이미지 리소스 임포트 (기존 ReplyInput 참고)
import checkedCheckbox from "@/resources/assets/posts/checked-checkbox.svg";
import uncheckedCheckbox from "@/resources/assets/posts/unchecked-checkbox.svg";

export default function ChattingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const [inputValue, setInputValue] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { messages, sendMessage, isLoading, error, myHash, roomInfo } = useChat(
    roomId ?? "",
  );

  useHeader({
    title: roomInfo ? roomInfo.title : "채팅방",
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInput = () => {
    const el = inputRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim(), isAnonymous);
    setInputValue("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const formatDateLine = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  const isSameDate = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  if (isLoading) {
    return <div>채팅 내역을 가져오고 있습니다...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ChatPageWrapper>
      {roomInfo && (
        <RoomInfoBanner>
          <Users size={16} color="#767676" />
          <span>
            참여 인원 {roomInfo.currentParticipants}명 / 최대{" "}
            {roomInfo.maxCapacity}명
          </span>
        </RoomInfoBanner>
      )}

      <ChattingWrapper ref={scrollRef}>
        {messages.map((msg, index) => {
          const showDateLine =
            index === 0 ||
            !isSameDate(messages[index - 1].createDate, msg.createDate);
          const isMe = msg.senderHash === myHash;

          return (
            <React.Fragment key={msg.messageId || `msg-${index}`}>
              {showDateLine && (
                <DateDivider>{formatDateLine(msg.createDate)}</DateDivider>
              )}
              {isMe ? (
                <ChatItemMy
                  content={msg.content}
                  time={new Date(msg.createDate).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ) : (
                <ChatItemOtherPerson
                  content={msg.content}
                  time={new Date(msg.createDate).toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  userImageUrl={null}
                  senderNickname={msg.senderNickname}
                />
              )}
            </React.Fragment>
          );
        })}
      </ChattingWrapper>

      <FixedInputArea>
        {/* 커스텀 이미지 체크박스 적용 */}
        <AnonymousToggle onClick={() => setIsAnonymous(!isAnonymous)}>
          <img
            src={isAnonymous ? checkedCheckbox : uncheckedCheckbox}
            alt="익명 체크박스"
          />
          <span>익명</span>
        </AnonymousToggle>

        <Input
          placeholder="메시지 입력"
          ref={inputRef}
          onInput={handleInput}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <SendButton onClick={handleSendMessage}>
          <Send size={24} color="#5844E4" />
        </SendButton>
      </FixedInputArea>
    </ChatPageWrapper>
  );
}

const ChatPageWrapper = styled.div`
  width: 100%;
  background: #f4f4f4;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RoomInfoBanner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #767676;
  flex-shrink: 0;
`;

const ChattingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 10px;
  box-sizing: border-box;
  background: #f4f4f4;
`;

const DateDivider = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 24px 0 16px 0;
  font-size: 12px;
  font-weight: 500;
  color: #767676;
`;

const FixedInputArea = styled.div`
  width: 100%;
  min-height: 64px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  padding-bottom: calc(
    8px + env(safe-area-inset-bottom)
  ); /* 아이폰 하단 대응 */
  box-sizing: border-box;
  gap: 8px;
  border-top: 1px solid #eaeaea;
  flex-shrink: 0;
`;

const Input = styled.textarea`
  flex: 1;
  min-width: 0;
  padding: 8px 16px;
  box-sizing: border-box;
  background: #eff2f9;
  border-radius: 20px;
  border: none;
  font-size: 16px;
  line-height: 24px;
  color: #1c1c1e;
  resize: none;
  outline: none;
  max-height: 96px;
`;

const SendButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 4px;
`;

const AnonymousToggle = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;

  img {
    width: 18px;
    height: 18px;
    display: block;
    flex-shrink: 0;
  }

  span {
    font-size: 13px;
    color: #9fa3a6;
    white-space: nowrap;
  }
`;

// 메시지 컴포넌트들 스타일 동일 유지
const MessageContainer = styled.div`
  display: flex;
  margin: 0 16px 12px;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
`;

const MessageContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SenderName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1c1c1e;
  margin-bottom: 4px;
`;

const MessageBubble = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
`;

const Bubble = styled.div`
  padding: 10px 14px;
  border-radius: 20px;
  font-size: 16px;
  line-height: 22px;
  max-width: 240px;
  word-break: break-word;
`;

const Time = styled.span`
  font-size: 12px;
  color: #767676;
  white-space: nowrap;
`;

const ChatItemOtherPerson = ({
  content,
  time,
  userImageUrl,
  senderNickname,
}: {
  content: string;
  time: string;
  userImageUrl: string | null;
  senderNickname: string;
}) => (
  <MessageContainer>
    {userImageUrl && <ProfileImage src={userImageUrl} alt="profile" />}
    <MessageContent>
      <SenderName>{senderNickname}</SenderName>
      <MessageBubble>
        <Bubble style={{ background: "#FFF", color: "#1C1C1E" }}>
          {content}
        </Bubble>
        <Time>{time}</Time>
      </MessageBubble>
    </MessageContent>
  </MessageContainer>
);

const MyMessageContainer = styled(MessageContainer)`
  justify-content: flex-end;
`;

const ChatItemMy = ({ content, time }: { content: string; time: string }) => (
  <MyMessageContainer>
    <MessageBubble>
      <Time>{time}</Time>
      <Bubble style={{ background: "#5844E4", color: "#FFF" }}>
        {content}
      </Bubble>
    </MessageBubble>
  </MyMessageContainer>
);
